import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
    Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../entities/user.entity';
import {
    CreateUserDto,
    UpdateUserDto,
    ChangeUserPasswordDto,
    UserQueryDto,
} from '../../dto/request/user.dto';
import {
    UserResponseDto,
    UserListResponseDto,
    UserStatsResponseDto,
    UserCreatedResponseDto,
    UserUpdatedResponseDto,
    UserDeletedResponseDto,
    UserPasswordChangedResponseDto,
} from '../../dto/response/user.dto';
import { UserRoleEnum } from '../../common/enum/global.enum';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) {}

    async create(createUserDto: CreateUserDto): Promise<UserCreatedResponseDto> {
        const existingUser = await this.usersRepository.findOne({
            where: [{ username: createUserDto.username }, { email: createUserDto.email }],
        });

        if (existingUser) {
            throw new ConflictException('Username or email already exists');
        }

        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

        const user = this.usersRepository.create({
            ...createUserDto,
            passwordHash: hashedPassword,
            role: createUserDto.role || UserRoleEnum.VIEWER,
            isActive: createUserDto.isActive !== undefined ? createUserDto.isActive : true,
        });

        const savedUser = await this.usersRepository.save(user);
        const userResponse = this.mapToUserResponse(savedUser);

        await this.cacheManager.del('users:list');

        return {
            message: 'User created successfully',
            user: userResponse,
        };
    }

    async findAll(queryDto: UserQueryDto): Promise<UserListResponseDto> {
        const { page = 1, limit = 10, username, email, role, regionId, isActive } = queryDto;

        const whereConditions: FindOptionsWhere<User> = {};

        if (username) {
            whereConditions.username = Like(`%${username}%`);
        }

        if (email) {
            whereConditions.email = Like(`%${email}%`);
        }

        if (role) {
            whereConditions.role = role;
        }

        if (regionId !== undefined) {
            whereConditions.regionId = regionId;
        }

        if (isActive !== undefined) {
            whereConditions.isActive = isActive;
        }

        const skip = (page - 1) * limit;

        const [users, total] = await this.usersRepository.findAndCount({
            where: whereConditions,
            skip,
            take: limit,
            order: { createdAt: 'DESC' },
            relations: ['region'],
        });

        const totalPages = Math.ceil(total / limit);
        const userResponses = users.map((user) => this.mapToUserResponse(user));

        return {
            users: userResponses,
            total,
            page,
            limit,
            totalPages,
        };
    }

    async findOne(id: string): Promise<UserResponseDto> {
        const user = await this.usersRepository.findOne({
            where: { id },
            relations: ['region'],
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        return this.mapToUserResponse(user);
    }

    async update(id: string, updateUserDto: UpdateUserDto): Promise<UserUpdatedResponseDto> {
        const user = await this.usersRepository.findOne({
            where: { id },
            relations: ['region'],
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        if (updateUserDto.email && updateUserDto.email !== user.email) {
            const existingUser = await this.usersRepository.findOne({
                where: { email: updateUserDto.email },
            });

            if (existingUser) {
                throw new ConflictException('Email already exists');
            }
        }

        if (updateUserDto.username && updateUserDto.username !== user.username) {
            const existingUser = await this.usersRepository.findOne({
                where: { username: updateUserDto.username },
            });

            if (existingUser) {
                throw new ConflictException('Username already exists');
            }
        }

        await this.usersRepository.update(id, {
            ...updateUserDto,
        });

        const updatedUser = await this.usersRepository.findOne({
            where: { id },
            relations: ['region'],
        });

        await this.cacheManager.del(`user:${id}`);
        await this.cacheManager.del('users:list');

        return {
            message: 'User updated successfully',
            user: this.mapToUserResponse(updatedUser),
        };
    }

    async changePassword(
        id: string,
        changePasswordDto: ChangeUserPasswordDto,
    ): Promise<UserPasswordChangedResponseDto> {
        const user = await this.usersRepository.findOne({
            where: { id },
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);

        await this.usersRepository.update(id, {
            passwordHash: hashedPassword,
        });

        return {
            message: 'Password changed successfully',
            userId: id,
        };
    }

    async toggleActiveStatus(id: string): Promise<UserUpdatedResponseDto> {
        const user = await this.usersRepository.findOne({
            where: { id },
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        const newStatus = !user.isActive;
        await this.usersRepository.update(id, { isActive: newStatus });

        const updatedUser = await this.usersRepository.findOne({
            where: { id },
            relations: ['region'],
        });

        await this.cacheManager.del(`user:${id}`);
        await this.cacheManager.del('users:list');

        return {
            message: `User ${newStatus ? 'activated' : 'deactivated'} successfully`,
            user: this.mapToUserResponse(updatedUser),
        };
    }

    async remove(id: string): Promise<UserDeletedResponseDto> {
        const user = await this.usersRepository.findOne({
            where: { id },
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        if (user.role === UserRoleEnum.ADMIN) {
            throw new BadRequestException('Cannot delete admin users');
        }

        await this.usersRepository.remove(user);

        await this.cacheManager.del(`user:${id}`);
        await this.cacheManager.del('users:list');

        return {
            message: 'User deleted successfully',
            userId: id,
        };
    }

    async getStats(): Promise<UserStatsResponseDto> {
        const totalUsers = await this.usersRepository.count();
        const activeUsers = await this.usersRepository.count({
            where: { isActive: true },
        });
        const inactiveUsers = await this.usersRepository.count({
            where: { isActive: false },
        });

        const usersByRole = await this.usersRepository
            .createQueryBuilder('user')
            .select('user.role', 'role')
            .addSelect('COUNT(*)', 'count')
            .groupBy('user.role')
            .getRawMany();

        const roleStats = {};
        usersByRole.forEach((item) => {
            roleStats[item.role] = parseInt(item.count);
        });

        const usersByRegion = await this.usersRepository
            .createQueryBuilder('user')
            .select('user.regionId', 'regionId')
            .addSelect('COUNT(*)', 'count')
            .groupBy('user.regionId')
            .getRawMany();

        const regionStats = {};
        usersByRegion.forEach((item) => {
            const regionKey = item.regionId ? `region_${item.regionId}` : 'no_region';
            regionStats[regionKey] = parseInt(item.count);
        });

        return {
            totalUsers,
            activeUsers,
            inactiveUsers,
            usersByRole: roleStats,
            usersByRegion: regionStats,
        };
    }

    private mapToUserResponse(user: User): UserResponseDto {
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            role: user.role,
            regionId: user.regionId,
            isActive: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
}
