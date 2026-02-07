import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Auditable } from '../audit/decorators/auditable.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { BedsService } from './beds.service';
import {
  CreateBedDto,
  UpdateBedStatusDto,
  BedResponseDto,
  BedStatus,
} from './dto/bed.dto';
import { CreateWardDto, UpdateWardDto } from './dto/ward.dto';
import { CreateRoomCategoryDto, UpdateRoomCategoryDto } from './dto/room-category.dto';

@Controller('beds')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BedsController {
  constructor(private bedsService: BedsService) {}

  // ===== WARD ENDPOINTS =====

  /**
   * POST /api/beds/wards
   * Create a new ward
   * Requires: ADMIN
   */
  @Post('wards')
  @Roles('ADMIN')
  @UsePipes(new ValidationPipe({ transform: true }))
  @Auditable('BEDS_CREATE_WARD')
  async createWard(
    @Body() dto: CreateWardDto,
    @CurrentUser() user: any,
  ) {
    return this.bedsService.createWard(dto, user.id);
  }

  /**
   * GET /api/beds/wards
   * List all wards
   * Requires: ADMIN, HEAD_NURSE, STAFF_NURSE, DOCTOR
   */
  @Get('wards')
  @Roles('ADMIN', 'HEAD_NURSE', 'STAFF_NURSE', 'DOCTOR')
  @Auditable('BEDS_LIST_WARDS')
  async listWards(
    @Query('isActive') isActive?: string,
    @Query('category') category?: string,
  ) {
    return this.bedsService.listWards({
      isActive: isActive === 'true',
      category,
    });
  }

  /**
   * GET /api/beds/wards/:id
   * Get ward details
   * Requires: ADMIN, HEAD_NURSE, STAFF_NURSE, DOCTOR
   */
  @Get('wards/:id')
  @Roles('ADMIN', 'HEAD_NURSE', 'STAFF_NURSE', 'DOCTOR')
  @Auditable('BEDS_VIEW_WARD')
  async getWard(@Param('id') id: string) {
    return this.bedsService.getWard(id);
  }

  /**
   * PATCH /api/beds/wards/:id
   * Update ward
   * Requires: ADMIN
   */
  @Patch('wards/:id')
  @Roles('ADMIN')
  @UsePipes(new ValidationPipe({ transform: true }))
  @Auditable('BEDS_UPDATE_WARD')
  async updateWard(
    @Param('id') id: string,
    @Body() dto: UpdateWardDto,
    @CurrentUser() user: any,
  ) {
    return this.bedsService.updateWard(id, dto, user.id);
  }

  // ===== ROOM CATEGORY ENDPOINTS =====

  /**
   * POST /api/beds/categories
   * Create room category
   * Requires: ADMIN
   */
  @Post('categories')
  @Roles('ADMIN')
  @UsePipes(new ValidationPipe({ transform: true }))
  @Auditable('BEDS_CREATE_CATEGORY')
  async createRoomCategory(@Body() dto: CreateRoomCategoryDto) {
    return this.bedsService.createRoomCategory(dto);
  }

  /**
   * GET /api/beds/categories
   * List room categories
   * Requires: ADMIN, HEAD_NURSE, STAFF_NURSE, DOCTOR
   */
  @Get('categories')
  @Roles('ADMIN', 'HEAD_NURSE', 'STAFF_NURSE', 'DOCTOR')
  @Auditable('BEDS_LIST_CATEGORIES')
  async listRoomCategories() {
    return this.bedsService.listRoomCategories();
  }

  /**
   * PATCH /api/beds/categories/:id
   * Update room category
   * Requires: ADMIN
   */
  @Patch('categories/:id')
  @Roles('ADMIN')
  @UsePipes(new ValidationPipe({ transform: true }))
  @Auditable('BEDS_UPDATE_CATEGORY')
  async updateRoomCategory(
    @Param('id') id: string,
    @Body() dto: UpdateRoomCategoryDto,
  ) {
    return this.bedsService.updateRoomCategory(id, dto);
  }

  // ===== BED ENDPOINTS =====

  /**
   * POST /api/beds
   * Create a bed
   * Requires: ADMIN
   */
  @Post()
  @Roles('ADMIN')
  @UsePipes(new ValidationPipe({ transform: true }))
  @Auditable('BEDS_CREATE_BED')
  async createBed(
    @Body() dto: CreateBedDto,
    @CurrentUser() user: any,
  ) {
    return this.bedsService.createBed(dto, user.id);
  }

  /**
   * GET /api/beds
   * List beds with filters
   * Requires: ADMIN, HEAD_NURSE, STAFF_NURSE, DOCTOR
   */
  @Get()
  @Roles('ADMIN', 'HEAD_NURSE', 'STAFF_NURSE', 'DOCTOR')
  @Auditable('BEDS_LIST_BEDS')
  async listBeds(
    @Query('wardId') wardId?: string,
    @Query('roomCategoryId') roomCategoryId?: string,
    @Query('status') status?: BedStatus,
  ) {
    return this.bedsService.listBeds({
      wardId,
      roomCategoryId,
      status,
    });
  }

  /**
   * GET /api/beds/:id
   * Get bed details
   * Requires: ADMIN, HEAD_NURSE, STAFF_NURSE, DOCTOR
   */
  @Get(':id')
  @Roles('ADMIN', 'HEAD_NURSE', 'STAFF_NURSE', 'DOCTOR')
  @Auditable('BEDS_VIEW_BED')
  async getBed(@Param('id') id: string) {
    return this.bedsService.getBed(id);
  }

  /**
   * PATCH /api/beds/:id/status
   * Update bed status
   * Requires: ADMIN, HEAD_NURSE
   */
  @Patch(':id/status')
  @Roles('ADMIN', 'HEAD_NURSE')
  @UsePipes(new ValidationPipe({ transform: true }))
  @Auditable('BEDS_UPDATE_BED_STATUS')
  async updateBedStatus(
    @Param('id') id: string,
    @Body() dto: UpdateBedStatusDto,
    @CurrentUser() user: any,
  ) {
    return this.bedsService.updateBedStatus(id, dto, user.id);
  }

  // ===== SUMMARY & ANALYTICS =====

  /**
   * GET /api/beds/summary/dashboard
   * Get bed summary and occupancy metrics
   * Requires: ADMIN, HEAD_NURSE
   */
  @Get('summary/dashboard')
  @Roles('ADMIN', 'HEAD_NURSE')
  @Auditable('BEDS_VIEW_SUMMARY')
  async getBedSummary() {
    return this.bedsService.getBedSummary();
  }

  /**
   * GET /api/beds/summary/by-category
   * Get beds grouped by ward and category
   * Requires: ADMIN, HEAD_NURSE
   */
  @Get('summary/by-category')
  @Roles('ADMIN', 'HEAD_NURSE')
  @Auditable('BEDS_VIEW_BY_CATEGORY')
  async getWardBedsByCategory() {
    return this.bedsService.getWardBedsByCategory();
  }
}
