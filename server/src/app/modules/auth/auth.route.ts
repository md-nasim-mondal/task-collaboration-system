import { NextFunction, Request, Response, Router } from "express";
import passport from "passport";
import { envVars } from "../../config/env";
import { checkAuth } from "../../middlewares/checkAuth";
import validateRequest from "../../middlewares/validateRequest";
import { Role } from "../user/user.interface";
import { AuthControllers } from "./auth.controller";
import { AuthValidation } from "./auth.validation";

const router = Router();

router.post(
  "/login",
  validateRequest(AuthValidation.loginValidationSchema),
  AuthControllers.credentialsLogin
);

router.post("/refresh-token", AuthControllers.getNewAccessToken);

router.post("/logout", AuthControllers.logout);

router.post(
  "/change-password",
  checkAuth(...Object.values(Role)),
  validateRequest(AuthValidation.changePasswordValidationSchema),
  AuthControllers.changePassword
);

router.post(
  "/set-password",
  checkAuth(...Object.values(Role)),
  AuthControllers.setPassword
);

router.post(
  "/forgot-password",
  validateRequest(AuthValidation.forgotPasswordValidationSchema),
  AuthControllers.forgotPassword
);

router.post(
  "/reset-password",
  checkAuth(...Object.values(Role)),
  validateRequest(AuthValidation.resetPasswordValidationSchema),
  AuthControllers.resetPassword
);

// Google OAuth Routes
router.get(
  "/google",
  (req: Request, res: Response, next: NextFunction) => {
    if (envVars.AUTH_SYSTEM !== "passport") {
      res.status(400).json({
        success: false,
        message: "Passport authentication is currently disabled.",
      });
      return;
    }
    const redirect = req.query.redirect || "/";
    passport.authenticate("google", {
      scope: ["profile", "email"],
      state: redirect as string,
    })(req, res, next);
  }
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${envVars.FRONTEND_URL}/login?error=auth_failed`,
  }),
  AuthControllers.googleCallbackController
);

export const AuthRoutes = router;
