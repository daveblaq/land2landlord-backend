import express from 'express';
import authRoute from './auth.routes';
import propertyRoute from './property.routes';
import leadRoute from './lead.routes';
import statsRoute from './stats.routes';
import activityRoute from './activity.routes';

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/properties',
    route: propertyRoute,
  },
  {
    path: '/leads',
    route: leadRoute,
  },
  {
    path: '/stats',
    route: statsRoute,
  },
  {
    path: '/activities',
    route: activityRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;