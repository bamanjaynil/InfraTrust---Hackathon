const ProjectModel = require('../models/projectModel');
const BoqModel = require('../models/boqModel');
const BoqEstimatorService = require('../services/boqEstimatorService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const db = require('../db/db');

class ProjectController {
  static createProject = catchAsync(async (req, res, next) => {
    const {
      name, start_lat, start_lng, end_lat, end_lng,
      soil_type, road_type, length, width, contractor_id,
      state, district, city
    } = req.body;

    // Use a transaction to ensure both project and BOQ are created together
    const client = await db.pool.connect();
    
    try {
      await client.query('BEGIN');

      // 1. Insert project into database
      const project = await ProjectModel.createProject({
        name, start_lat, start_lng, end_lat, end_lng,
        soil_type, road_type, length, width, contractor_id,
        state, district, city
      }, client);

      // 2. Automatically generate BoQ using estimator
      const boqData = BoqEstimatorService.calculateMaterials(length, width, soil_type, road_type);

      // 3. Insert BoQ into boq table (locked = true is handled in model)
      const boq = await BoqModel.createBoq({
        project_id: project.id,
        ...boqData
      }, client);

      await client.query('COMMIT');

      res.status(201).json({
        status: 'success',
        data: {
          project,
          boq
        }
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  });

  static getProjects = catchAsync(async (req, res, next) => {
    const { role, user_id } = req.user;
    const { type, district, city, lat, lng, radius } = req.query;
    let projects;

    if (role === 'ADMIN' || role === 'CITIZEN') {
      if (type === 'area' && (district || city)) {
        projects = await ProjectModel.findByArea(district, city);
      } else if (type === 'nearby' && lat && lng) {
        projects = await ProjectModel.findNearby(parseFloat(lat), parseFloat(lng), parseFloat(radius) || 20);
      } else {
        // Admins and citizens can view all projects
        projects = await ProjectModel.findAll();
      }
    } else if (role === 'CONTRACTOR') {
      // Contractors view assigned projects only
      projects = await ProjectModel.findByContractorId(user_id);
    } else {
      // Drivers have no access to project list in this context
      return next(new AppError('Unauthorized access to projects', 403));
    }

    res.status(200).json({
      status: 'success',
      results: projects.length,
      data: {
        projects
      }
    });
  });

  static getProjectById = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { role, user_id } = req.user;

    const project = await ProjectModel.findById(id);

    if (!project) {
      return next(new AppError('Project not found', 404));
    }

    // Authorization check
    if (role === 'CONTRACTOR' && project.contractor_id !== user_id) {
      return next(new AppError('You do not have permission to view this project', 403));
    }
    if (role === 'DRIVER') {
      return next(new AppError('Unauthorized access to project details', 403));
    }

    const boq = await BoqModel.findByProjectId(id);

    res.status(200).json({
      status: 'success',
      data: {
        project,
        boq
      }
    });
  });

  static updateProjectStatus = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body;
    const { role, user_id } = req.user;

    const validStatuses = ['PLANNED', 'ACTIVE', 'COMPLETED', 'FAILED'];
    if (!validStatuses.includes(status)) {
      return next(new AppError('Invalid status', 400));
    }

    const project = await ProjectModel.findById(id);
    if (!project) {
      return next(new AppError('Project not found', 404));
    }

    // Only ADMIN or the assigned CONTRACTOR can update status
    if (role !== 'ADMIN' && (role !== 'CONTRACTOR' || project.contractor_id !== user_id)) {
      return next(new AppError('You do not have permission to update this project status', 403));
    }

    const updatedProject = await ProjectModel.updateStatus(id, status);

    res.status(200).json({
      status: 'success',
      data: {
        project: updatedProject
      }
    });
  });
}

module.exports = ProjectController;
