export const options = {
    definition: {
        openapi: "3.1.0",
        info: {
            title: "Zen Space backend app",
            version: "1.0.0",
            description:
                "This is the backend app for zenspace",
            license: {
                name: "MIT",
                url: "https://spdx.org/licenses/MIT.html",
            },
        },
        components: {
            securitySchemes: {
                "JWT": {
                    "description": "",
                    "type": "apiKey",
                    "name": "Authorization",
                    "in": "header"
                }
            },
            schemas: {
                RegisterRequest: {
                    type: 'object',
                    properties: {
                        firstname: {type: 'string'},
                        lastname: {type: 'string'},
                        email: {type: 'string'},
                        password: {type: 'string'}
                    },
                    required: ['first_name', 'last_name', 'email', 'password']
                },
                LoginRequest: {
                    type: 'object',
                    properties: {
                        email: {type: 'string'},
                        password: {type: 'string'}
                    },
                    required: ['email', 'password']
                },
                LoginResponse: {
                    type: 'object',
                    properties: {
                        data: {
                            type: 'object',
                            properties: {
                                user_id: {type: 'number'},
                                email: {type: 'string'},
                                role: {type: 'string'},
                                token: {type: 'string'}
                            }
                        }
                    }
                },
                GenericResponse: {
                    type: 'object',
                    properties: {
                        message: {type: 'string'}
                    }
                },
                LocationResponse: {
                    type: "object",
                    properties: {
                        data: {
                            type: 'object',
                            properties: {
                                location_id: {type: 'number'},
                                name: {type: 'string'},
                                province: {type: 'string'},
                                latitude: {type: 'float'},
                                longitude: {type: 'float'}
                            }
                        }
                    }
                }
            }
        },
        servers: [
            {
                url: "/api",
            },
        ],
    },
    apis: ["./routes/**/*.ts"],
};