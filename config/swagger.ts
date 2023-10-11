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
                                firstname: {type: 'string'},
                                lastname: {type: 'string'},
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
                },
                WorkspaceAddress : {
                    type: 'object',
                    properties: {
                        workspace_address_id: {type: 'integer'},
                        address: {type: 'string'},
                        latitude: {type: 'number'},
                        longitude: {type: 'number'}
                    }
                },
                Location : {
                    type: 'object',
                    properties: {
                        location_id: {type: 'integer'},
                        name: {type: 'string'},
                        province: {type: 'string'},
                        latitude: {type: 'number'},
                        longitude: {type: 'number'}
                    }
                },
                Workspace : {
                    type: 'object',
                    properties: {
                        workspace_id: {type: 'integer'},
                        name: {type: 'string'},
                        description: {type: 'string'},
                        workspace_type: {type: 'string'},
                        price_per_day: {type: 'number'},
                        no_of_spaces: {type: 'integer'},
                        location_id: {type: 'integer'},
                        address_id: {type: 'integer'},
                        reviews: {
                            type: 'array',
                            items: {'$ref': '#/components/schemas/Review'}
                        },
                        workspaceAddress: {'$ref': '#/components/schemas/WorkspaceAddress'},
                        location: {'$ref': '#/components/schemas/Location'}
                    }
                },
                WorkSpaceSearchResponse : {
                    type: 'object',
                    properties: {
                        data: {
                            type: 'array',
                            items: {'$ref': '#/components/schemas/Workspace'}
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