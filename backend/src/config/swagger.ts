import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "School ERP API",
      version: "1.0.0",
      description: "School ERP — Admin Panel API Documentation",
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Login karke accessToken copy karo aur yahan paste karo",
        },
      },
      schemas: {
        // ── Auth ──────────────────────────────────────────────
        LoginInput: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", example: "superadmin@school.com" },
            password: { type: "string", example: "SuperAdmin@123" },
          },
        },
        ChangePasswordInput: {
          type: "object",
          required: ["currentPassword", "newPassword", "confirmPassword"],
          properties: {
            currentPassword: { type: "string", example: "SuperAdmin@123" },
            newPassword: { type: "string", example: "NewPass@456" },
            confirmPassword: { type: "string", example: "NewPass@456" },
          },
        },

        // ── Admin ─────────────────────────────────────────────
        CreateAdminInput: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: { type: "string", example: "Ali Hassan" },
            email: { type: "string", example: "ali@school.com" },
            password: { type: "string", example: "Admin@1234" },
            phone: { type: "string", example: "03001234567" },
          },
        },
        UpdateAdminInput: {
          type: "object",
          properties: {
            name: { type: "string", example: "Ali Hassan" },
            phone: { type: "string", example: "03001234567" },
            avatar: { type: "string", example: "https://res.cloudinary.com/..." },
          },
        },

        // ── Class ─────────────────────────────────────────────
        CreateClassInput: {
          type: "object",
          required: ["name", "section", "academicYearId"],
          properties: {
            name: { type: "string", example: "Grade 5" },
            section: { type: "string", example: "A" },
            academicYearId: { type: "string", example: "cmmut2t2s0000..." },
            capacity: { type: "number", example: 40 },
          },
        },
        UpdateClassInput: {
          type: "object",
          properties: {
            name: { type: "string", example: "Grade 5" },
            section: { type: "string", example: "B" },
            capacity: { type: "number", example: 45 },
          },
        },

        // ── Student ───────────────────────────────────────────
        CreateStudentInput: {
          type: "object",
          required: [
            "name", "gender", "dateOfBirth", "rollNo",
            "admissionNo", "admissionDate", "classId",
            "fatherName", "fatherPhone",
          ],
          properties: {
            name: { type: "string", example: "Ahmed Ali" },
            gender: { type: "string", enum: ["MALE", "FEMALE", "OTHER"] },
            dateOfBirth: { type: "string", example: "2010-05-15" },
            religion: { type: "string", example: "Islam" },
            address: { type: "string", example: "House 12, Street 4, Bahawalpur" },
            photo: { type: "string", example: "https://res.cloudinary.com/..." },
            rollNo: { type: "string", example: "2024-001" },
            admissionNo: { type: "string", example: "ADM-2024-001" },
            admissionDate: { type: "string", example: "2024-04-01" },
            classId: { type: "string", example: "cmmut2t2s0000..." },
            fatherName: { type: "string", example: "Ali Ahmed" },
            fatherPhone: { type: "string", example: "03001234567" },
            fatherCnic: { type: "string", example: "31301-1234567-1" },
            motherName: { type: "string", example: "Fatima Ali" },
            motherPhone: { type: "string", example: "03001234568" },
            guardianName: { type: "string", example: "" },
            guardianPhone: { type: "string", example: "" },
          },
        },
        TransferStudentInput: {
          type: "object",
          required: ["transferDate", "transferredTo"],
          properties: {
            transferDate: { type: "string", example: "2024-12-01" },
            transferredTo: { type: "string", example: "City School Lahore" },
            reason: { type: "string", example: "Family relocation" },
            certificateNo: { type: "string", example: "TC-2024-001" },
            issuedBy: { type: "string", example: "Principal" },
          },
        },

        // ── Common Responses ──────────────────────────────────
        SuccessResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Operation successful" },
            data: { type: "object" },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Something went wrong" },
            errors: { type: "array", items: { type: "string" } },
          },
        },
      },
    },

    // ── All Paths ─────────────────────────────────────────────
    paths: {

      // ════════════════════════════════════════════════════════
      // AUTH
      // ════════════════════════════════════════════════════════
      "/api/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Login",
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/LoginInput" } } },
          },
          responses: {
            200: { description: "Login successful — accessToken milega" },
            401: { description: "Invalid credentials" },
          },
        },
      },
      "/api/auth/refresh": {
        post: {
          tags: ["Auth"],
          summary: "Naya access token lo (cookie se refresh token use hoga)",
          responses: {
            200: { description: "New accessToken" },
            401: { description: "Refresh token invalid ya expired" },
          },
        },
      },
      "/api/auth/logout": {
        post: {
          tags: ["Auth"],
          summary: "Logout",
          responses: { 200: { description: "Logged out" } },
        },
      },
      "/api/auth/logout-all": {
        post: {
          tags: ["Auth"],
          summary: "Sab devices se logout",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Logged out from all devices" } },
        },
      },
      "/api/auth/me": {
        get: {
          tags: ["Auth"],
          summary: "Apni profile dekho",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "User profile" } },
        },
      },
      "/api/auth/change-password": {
        patch: {
          tags: ["Auth"],
          summary: "Password change karo",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/ChangePasswordInput" } } },
          },
          responses: { 200: { description: "Password changed" } },
        },
      },

      // ════════════════════════════════════════════════════════
      // ADMINS — Super Admin only
      // ════════════════════════════════════════════════════════
      "/api/admins": {
        get: {
          tags: ["Admins"],
          summary: "Sab admins ki list (Super Admin only)",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "page", in: "query", schema: { type: "integer", default: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
            { name: "search", in: "query", schema: { type: "string" } },
          ],
          responses: { 200: { description: "Admins list with pagination" } },
        },
        post: {
          tags: ["Admins"],
          summary: "Naya admin banao (Super Admin only)",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/CreateAdminInput" } } },
          },
          responses: {
            201: { description: "Admin created" },
            409: { description: "Email already exists" },
          },
        },
      },
      "/api/admins/{id}": {
        get: {
          tags: ["Admins"],
          summary: "Single admin dekho",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Admin data" }, 404: { description: "Not found" } },
        },
        patch: {
          tags: ["Admins"],
          summary: "Admin update karo",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateAdminInput" } } },
          },
          responses: { 200: { description: "Updated" } },
        },
        delete: {
          tags: ["Admins"],
          summary: "Admin delete karo",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Deleted" } },
        },
      },
      "/api/admins/{id}/toggle-status": {
        patch: {
          tags: ["Admins"],
          summary: "Admin activate / deactivate karo",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Status toggled" } },
        },
      },

      // ════════════════════════════════════════════════════════
      // CLASSES
      // ════════════════════════════════════════════════════════
      "/api/classes/academic-years": {
        get: {
          tags: ["Classes"],
          summary: "Academic years ki list (dropdown ke liye)",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Academic years" } },
        },
      },
      "/api/classes": {
        get: {
          tags: ["Classes"],
          summary: "Sab classes",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "academicYearId", in: "query", schema: { type: "string" } },
          ],
          responses: { 200: { description: "Classes list" } },
        },
        post: {
          tags: ["Classes"],
          summary: "Nai class banao",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/CreateClassInput" } } },
          },
          responses: { 201: { description: "Class created" }, 409: { description: "Already exists" } },
        },
      },
      "/api/classes/{id}": {
        get: {
          tags: ["Classes"],
          summary: "Single class — students aur subjects ke saath",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Class detail" } },
        },
        patch: {
          tags: ["Classes"],
          summary: "Class update karo",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateClassInput" } } },
          },
          responses: { 200: { description: "Updated" } },
        },
        delete: {
          tags: ["Classes"],
          summary: "Class delete karo (sirf agar koi student na ho)",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Deleted" }, 400: { description: "Students enrolled hain" } },
        },
      },

      // ════════════════════════════════════════════════════════
      // STUDENTS
      // ════════════════════════════════════════════════════════
      "/api/students/stats": {
        get: {
          tags: ["Students"],
          summary: "Student stats — total, active, boys, girls",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Stats" } },
        },
      },
      "/api/students": {
        get: {
          tags: ["Students"],
          summary: "Sab students — search, filter, pagination",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "page", in: "query", schema: { type: "integer", default: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
            { name: "search", in: "query", schema: { type: "string" }, description: "Name, rollNo, admissionNo, fatherName, phone" },
            { name: "classId", in: "query", schema: { type: "string" } },
            { name: "status", in: "query", schema: { type: "string", enum: ["ACTIVE", "TRANSFERRED", "LEFT", "GRADUATED"] } },
            { name: "gender", in: "query", schema: { type: "string", enum: ["MALE", "FEMALE", "OTHER"] } },
          ],
          responses: { 200: { description: "Students list with pagination" } },
        },
        post: {
          tags: ["Students"],
          summary: "Naya student enroll karo",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/CreateStudentInput" } } },
          },
          responses: { 201: { description: "Student enrolled" }, 409: { description: "Roll/Admission no already exists" } },
        },
      },
      "/api/students/{id}": {
        get: {
          tags: ["Students"],
          summary: "Single student profile",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Student data" } },
        },
        patch: {
          tags: ["Students"],
          summary: "Student update karo",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            content: { "application/json": { schema: { type: "object" } } },
          },
          responses: { 200: { description: "Updated" } },
        },
        delete: {
          tags: ["Students"],
          summary: "Student ko LEFT mark karo",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Marked as left" } },
        },
      },
      "/api/students/{id}/transfer": {
        post: {
          tags: ["Students"],
          summary: "Student transfer karo",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/TransferStudentInput" } } },
          },
          responses: { 200: { description: "Transferred" } },
        },
      },
    },
  },
  apis: [], // Sab paths upar manually define hain
};

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
  // Swagger UI
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customSiteTitle: "School ERP API",
      customCss: ".swagger-ui .topbar { display: none }",
      swaggerOptions: {
        persistAuthorization: true, // Token refresh pe bhi rahega
      },
    })
  );

  

  // Raw JSON spec bhi available hai
  app.get("/api-docs.json", (_req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  console.log("📋 Swagger docs: http://localhost:5000/api-docs");
};

