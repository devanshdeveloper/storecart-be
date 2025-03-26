const express = require("express");
const validatorMiddleware = require("../../middleware/validatorMiddleware");
const Models = require("../../models");
const {
  AuthHelper,
  ResponseHelper,
  RequestHelper,
  EmailHelper,
  EncryptionHelper,
  FileSystemHelper,
  FileUploadHelper,
  AuthStateHelper,
  ImageHelper,
  validator,
  ExpressHelper,
  ExpressValidator,
} = require("../../helpers");
const ErrorMap = require("../../constants/ErrorMap");
const { AuthState } = require("../../constants");

// Configure file upload helper for avatar uploads
const fileUploadHelper = new FileUploadHelper();
const upload = fileUploadHelper.configureImageUpload();
const router = express.Router();

const authHelper = new AuthHelper();
const authStateHelper = new AuthStateHelper();
const expressHelper = new ExpressHelper();
const User = Models.User;
const Storefront = Models.Storefront;
const Bank = Models.Bank;

// Register new user
router.post(
  "/register",
  validatorMiddleware({
    body: {
      currentState: [validator.required(), validator.string()],
    },
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);
    const validator = new ExpressValidator();
    validator.setRequest(req);
    try {
      const { currentState, ...body } = requestHelper.body();

      if (!authStateHelper.isValidState(currentState)) {
        return responseHelper.error(ErrorMap.INVALID_AUTH_STATE).send();
      }

      let user;

      // Handle Basic Details state
      if (currentState === AuthState.BasicDetails) {
        const errors = await validator.validate({
          body: {
            name: [validator.required(), validator.string()],
            email: [
              validator.required(),
              validator.string(),
              validator.email(),
            ],
            password: [
              validator.required(),
              validator.string(),
              validator.minLength(8),
            ],
          },
        });
        if (errors) {
          return responseHelper.errors(errors).send();
        }

        const { name, email, password } = body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return responseHelper
            .error({ ...ErrorMap.EMAIL_ALREADY_EXISTS, field: "email" })
            .send();
        }

        // Create new user with initial state
        const hashedPassword = await authHelper.hashPassword(password);
        user = await User.create({
          name,
          email,
          password: hashedPassword,
          authState: AuthState.InstituteDetails,
        });

        // Generate new token
        const token = authHelper.generateUserToken(user);

        return responseHelper
          .status(200)
          .body({
            user: await User.Response(user),
            token,
          })
          .send();

        // // Send verification email
        // const emailHelper = new EmailHelper();
        // const encryptionHelper = new EncryptionHelper();
        // const verificationToken = await encryptionHelper.encrypt(
        //   `${user._id}-${user.email}`
        // );

        // await emailHelper.sendEmail({
        //   to: email,
        //   subject: "Verify your email",
        //   htmlContent: renderTemplate(EmailVerificationTemplate, {
        //     verificationLink: `${process.env.FRONTEND_URL}/verify-email/${verificationToken.encrypted}`,
        //   }),
        // });

        // await User.findByIdAndUpdate(user._id, {
        //   emailVerificationToken: verificationToken.encrypted,
        //   emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000,
        // });
      } else {
        // For other states, get existing user from token
        await expressHelper.wrapMiddleware(authHelper.authenticate())(req, res);
        const user = req.user;

        if (currentState === AuthState.StorefrontDetails) {
          const storefrontData = body;
          storefrontData.user = user._id;

          // Create new storefront
          const storefront = await Storefront.create(storefrontData);

          // Update user's auth state
          await User.findByIdAndUpdate(user._id, {
            authState: AuthState.BankDetails,
          });

          return responseHelper
            .status(200)
            .body({
              user: await User.Response(user),
              storefront,
            })
            .send();
        }

        if (currentState === AuthState.BankDetails) {
          const bankData = body;
          bankData.user = user._id;

          // Create new bank
          const bank = await Bank.create(bankData);

          // Update user's auth state
          await User.findByIdAndUpdate(user._id, {
            authState: AuthState.Complete,
          });

          return responseHelper
            .status(200)
            .body({
              user: await User.Response(user),
              bank,
            })
            .send();
        }
      }
    } catch (error) {
      responseHelper.error(error).send();
    }
  }
);

// Login user
router.post(
  "/login",
  validatorMiddleware({
    body: {
      email: [validator.required(), validator.string(), validator.email()],
      password: [validator.required(), validator.string()],
    },
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);
    try {
      const { email, password } = requestHelper.body();

      // Check if user exists
      const user = await User.findOne({ email }).select("+password");

      if (!user) {
        return responseHelper
          .error({ ...ErrorMap.USER_NOT_FOUND, field: "email" })
          .send();
      }

      // Check if password is correct
      const isPasswordCorrect = await authHelper.comparePassword(
        password,
        user.password
      );

      if (!isPasswordCorrect) {
        return responseHelper
          .error({ ...ErrorMap.INCORRECT_PASSWORD, field: "password" })
          .send();
      }

      // Generate JWT token
      const token = authHelper.generateUserToken(user);

      return responseHelper
        .status(200)
        .body({
          user: await User.Response(user),
          token,
        })
        .send();
    } catch (error) {
      responseHelper.error(error).send();
    }
  }
);

// Verify email
router.post(
  "/verify-email",
  validatorMiddleware({
    body: {
      token: [validator.required(), validator.string()],
    },
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);
    try {
      const { token } = requestHelper.body();

      // Find user with matching verification token
      const user = await User.findOne({
        emailVerificationToken: token,
        emailVerificationExpires: { $gt: Date.now() },
      });

      if (!user) {
        return responseHelper
          .status(400)
          .error({
            ...ErrorMap.INVALID_TOKEN,
            message: "Invalid or expired verification token",
          })
          .send();
      }

      // Update user verification status
      user.emailVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      await user.save();

      return responseHelper
        .status(200)
        .body({ message: "Email verified successfully" })
        .send();
    } catch (error) {
      responseHelper.error(error).send();
    }
  }
);

// Reset password
router.post(
  "/reset-password",
  validatorMiddleware({
    body: {
      token: [validator.required(), validator.string()],
      password: [
        validator.required(),
        validator.string(),
        validator.minLength(8),
      ],
    },
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);
    try {
      const { token, password } = requestHelper.body();

      // Find user with matching reset token
      const user = await User.findOne({
        passwordResetToken: token,
        passwordResetExpires: { $gt: Date.now() },
      }).select("+password");

      if (!user) {
        return responseHelper
          .status(400)
          .error({
            ...ErrorMap.INVALID_TOKEN,
            message: "Invalid or expired reset token",
          })
          .send();
      }

      // Update password
      const hashedPassword = await authHelper.hashPassword(password);
      user.password = hashedPassword;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      return responseHelper
        .status(200)
        .body({ message: "Password reset successfully" })
        .send();
    } catch (error) {
      responseHelper.error(error).send();
    }
  }
);

// Get current user
router.get("/me", authHelper.authenticate(), async (req, res) => {
  const responseHelper = new ResponseHelper(res);
  try {
    console.log(req.user);

    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return responseHelper.error(ErrorMap.USER_NOT_FOUND).send();
    }
    return responseHelper
      .status(200)
      .body({ user: await User.Response(user) })
      .send();
  } catch (error) {
    responseHelper.error(error).send();
  }
});

// Update current user
router.put(
  "/update-me",
  authHelper.authenticate(),
  validatorMiddleware({
    body: {
      name: [
        validator.string(),
        validator.minLength(2),
        validator.maxLength(50),
      ],
      email: [validator.string(), validator.email()],
      phone: [validator.string()],
      address: [validator.string(), validator.minLength(10)],
    },
  }),
  upload.single("avatar"),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);
    try {
      const updates = requestHelper.body();

      // Handle avatar upload if file is present
      if (req.file) {
        try {
          // If user already has an avatar, delete the old one
          const user = await User.findById(req.user._id);
          if (user.avatar) {
            await FileSystemHelper.removeImage(user.avatar);
          }

          // Save new avatar and get URL
          updates.avatar = await FileSystemHelper.saveImage({
            buffer: req.file.buffer,
            filename: req.file.originalname,
            path: `/${req.user._id}/avatars`,
          });
        } catch (error) {
          return responseHelper
            .error("Failed to process avatar image")
            .status(400)
            .send();
        }
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { $set: updates },
        { new: true }
      ).select("-password");

      return responseHelper.status(200).body({ user: updatedUser }).send();
    } catch (error) {
      responseHelper.error(error).send();
    }
  }
);

// Delete current user
router.delete("/delete", authHelper.authenticate(), async (req, res) => {
  const responseHelper = new ResponseHelper(res);
  try {
    const user = await User.findByIdAndDelete(req.user._id);
    if (!user) {
      return responseHelper.error(ErrorMap.USER_NOT_FOUND).send();
    }
    return responseHelper
      .status(200)
      .body({ message: "User deleted successfully" })
      .send();
  } catch (error) {
    responseHelper.error(error).send();
  }
});

// Forget password
router.post(
  "/forget-password",
  validatorMiddleware({
    body: {
      email: [validator.required(), validator.string(), validator.email()],
    },
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);
    try {
      const { email } = requestHelper.body();

      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return responseHelper.error(ErrorMap.USER_NOT_FOUND).send();
      }

      // Generate password reset token
      const encryptionHelper = new EncryptionHelper();
      const resetToken = await encryptionHelper.encrypt(
        `${user._id}-${Date.now()}`
      );

      // Save reset token to user
      await User.findByIdAndUpdate(user._id, {
        passwordResetToken: resetToken.encrypted,
        passwordResetExpires: Date.now() + 1 * 60 * 60 * 1000, // 1 hour
      });

      // Send password reset email
      const emailHelper = new EmailHelper();
      await emailHelper.sendEmail({
        to: email,
        subject: "Password Reset Request",
        htmlContent: `<p>Click the link below to reset your password:</p><p><a href="${process.env.FRONTEND_URL}/reset-password/${resetToken.encrypted}">Reset Password</a></p>`,
      });

      return responseHelper
        .status(200)
        .body({ message: "Password reset link sent to email" })
        .send();
    } catch (error) {
      responseHelper.error(error).send();
    }
  }
);

// Change password
router.put(
  "/change-password",
  authHelper.authenticate(),
  validatorMiddleware({
    body: {
      currentPassword: [validator.required(), validator.string()],
      newPassword: [
        validator.required(),
        validator.string(),
        validator.minLength(8),
      ],
    },
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);
    try {
      const { currentPassword, newPassword } = requestHelper.body();

      // Get user with password
      const user = await User.findById(req.user._id).select("+password");
      if (!user) {
        return responseHelper.error(ErrorMap.USER_NOT_FOUND).send();
      }

      // Verify current password
      const isPasswordCorrect = await authHelper.comparePassword(
        currentPassword,
        user.password
      );

      if (!isPasswordCorrect) {
        return responseHelper.error(ErrorMap.INCORRECT_PASSWORD).send();
      }

      // Hash new password
      const hashedPassword = await authHelper.hashPassword(newPassword);

      // Update password
      await User.findByIdAndUpdate(user._id, {
        password: hashedPassword,
      });

      return responseHelper
        .status(200)
        .body({ message: "Password updated successfully" })
        .send();
    } catch (error) {
      responseHelper.error(error).send();
    }
  }
);

// logut
router.post("/logout", authHelper.authenticate(), async (req, res) => {
  const responseHelper = new ResponseHelper(res);
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return responseHelper.error(ErrorMap.USER_NOT_FOUND).send();
    }
    // Clear JWT token
    const token = authHelper.extractTokenFromHeader(req);

    if (token) {
      await authHelper.blacklistToken(token);
    }

    return responseHelper
      .status(200)
      .body({ message: "Logged out successfully" })
      .send();
  } catch (error) {
    responseHelper.error(error).send();
  }
});

module.exports = router;
