/**
 * OpenAPI 3.0 Schema for Pristine Hospital API
 * Provides API documentation and schema validation
 */

export function GET() {
  const openApiSchema = {
    openapi: "3.0.0",
    info: {
      title: "Pristine Hospital API",
      description:
        "API for Pristine Hospital - Public endpoints for doctor information",
      version: "1.0.0",
      contact: {
        name: "Pristine Hospital Support",
        email: "api@pristinehospital.com",
      },
    },
    servers: [
      {
        url: "http://localhost:3001",
        description: "Development Server",
      },
      {
        url: process.env.NEXT_PUBLIC_API_URL || "https://api.pristinehospital.com",
        description: "Production Server",
      },
    ],
    paths: {
      "/doctors": {
        get: {
          tags: ["Doctors"],
          summary: "Get all doctors",
          description: "Retrieve a list of all doctors with their specializations",
          parameters: [
            {
              name: "specialization",
              in: "query",
              description: "Filter doctors by specialization",
              required: false,
              schema: {
                type: "string",
                examples: ["Cardiology", "Orthopedics", "Neurology"],
              },
            },
          ],
          responses: {
            "200": {
              description: "Successful response",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: { type: "string", example: "success" },
                      data: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Doctor" },
                      },
                    },
                  },
                },
              },
            },
            "500": {
              description: "Server error",
            },
          },
        },
      },
      "/doctors/{id}": {
        get: {
          tags: ["Doctors"],
          summary: "Get doctor by ID",
          description: "Retrieve detailed information about a specific doctor",
          parameters: [
            {
              name: "id",
              in: "path",
              description: "Doctor ID",
              required: true,
              schema: { type: "string", format: "uuid" },
            },
          ],
          responses: {
            "200": {
              description: "Successful response",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: { type: "string" },
                      data: { $ref: "#/components/schemas/Doctor" },
                    },
                  },
                },
              },
            },
            "404": {
              description: "Doctor not found",
            },
          },
        },
      },
    },
    components: {
      schemas: {
        Doctor: {
          type: "object",
          required: [
            "id",
            "firstName",
            "lastName",
            "email",
            "phone",
            "specialization",
            "yearsOfExperience",
          ],
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "Unique doctor identifier",
            },
            firstName: {
              type: "string",
              description: "Doctor's first name",
              example: "HM",
            },
            lastName: {
              type: "string",
              description: "Doctor's last name",
              example: "Prasanna",
            },
            email: {
              type: "string",
              format: "email",
              description: "Doctor's email address",
            },
            phone: {
              type: "string",
              description: "Doctor's phone number",
            },
            qualifications: {
              type: "array",
              items: { type: "string" },
              description: "Professional qualifications",
              example: ["MD", "DNB Orthopedics"],
            },
            specialization: {
              type: "string",
              description: "Medical specialization",
              example: "Orthopedics",
            },
            yearsOfExperience: {
              type: "integer",
              description: "Years of professional experience",
              example: 18,
            },
            registrationNumber: {
              type: "string",
              description: "Medical registration number",
              nullable: true,
            },
            bio: {
              type: "string",
              description: "Professional biography",
              nullable: true,
            },
          },
        },
      },
    },
  };

  return Response.json(openApiSchema, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, s-maxage=86400",
    },
  });
}
