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
                WorkspaceAddress: {
                    type: 'object',
                    properties: {
                        workspace_address_id: {type: 'integer'},
                        address: {type: 'string'},
                        latitude: {type: 'number'},
                        longitude: {type: 'number'}
                    }
                },
                Location: {
                    type: 'object',
                    properties: {
                        location_id: {type: 'integer'},
                        name: {type: 'string'},
                        province: {type: 'string'},
                        latitude: {type: 'number'},
                        longitude: {type: 'number'}
                    }
                },
                Review: {
                    type: 'object',
                    properties: {
                        review_id: {type: 'integer'},
                        rating: {type: 'number'},
                        comments: {type: 'string', nullable: true},
                        review_date: {type: 'string', format: 'date-time'},
                        workspace_id: {type: 'integer'}
                    }
                },
                Workspace: {
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
                        avgRating: {type: 'number'},
                        reviews: {
                            type: 'array',
                            items: {'$ref': '#/components/schemas/Review'}
                        },
                        workspaceAddress: {'$ref': '#/components/schemas/WorkspaceAddress'},
                        location: {'$ref': '#/components/schemas/Location'},
                        workspaceAmenities: {
                            type: 'array',
                            items: {'$ref': '#/components/schemas/WorkspaceAmenities'}
                        },
                        workspacePhotos: {
                            type: 'array',
                            items: {'$ref': '#/components/schemas/WorkspacePhotos'}
                        }
                    }
                },
                WorkspaceAmenities: {
                    type: 'object',
                    properties: {
                        description: {type: 'string'}
                    }
                },
                WorkspacePhotos: {
                    type: 'object',
                    properties: {
                        photo_url: {type: 'string'}
                    }
                },
                WorkSpaceSearchResponse: {
                    type: 'object',
                    properties: {
                        meta: {
                            type: 'object',
                            properties: {
                                currentPage: {type: 'integer'},
                                pageSize: {type: 'integer'},
                                totalResults: {type: 'integer'},
                                totalPages: {type: 'integer'},
                                sortBy: {type: 'string'},
                                sortOrder: {type: 'string'}
                            }
                        },
                        data: {
                            type: 'array',
                            items: {'$ref': '#/components/schemas/Workspace'}
                        }
                    }
                },
                WorkspaceDetails: {
                    type: "object",
                    properties: {
                        id: {
                            type: "integer"
                        },
                        type: {
                            type: "string",
                            enum: ["MULTIPLE_DAYS", "ONE_DAY"]
                        }
                    },
                    required: ["id", "type"]
                },
                DateSelected: {
                    type: "object",
                    properties: {
                        start: {
                            type: "string",
                            format: "date"
                        },
                        end: {
                            type: "string",
                            format: "date"
                        }
                    },
                    required: ["start", "end"]
                },
                BookingDetail: {
                    type: "object",
                    properties: {
                        dateSelected: {
                            $ref: "#/components/schemas/DateSelected"
                        },
                        peopleCount: {
                            type: "integer"
                        }
                    },
                    required: ["dateSelected", "peopleCount"]
                },
                ChargeDetail: {
                    type: "object",
                    properties: {
                        charge: {
                            type: "number"
                        },
                        tax: {
                            type: "number"
                        },
                        Total: {
                            type: "number"
                        }
                    },
                    required: ["charge", "tax", "Total"]
                },
                CheckoutRequest: {
                    type: "object",
                    properties: {
                        workspace: {
                            $ref: "#/components/schemas/WorkspaceDetails"
                        },
                        bookingDetail: {
                            $ref: "#/components/schemas/BookingDetail"
                        },
                        chargeDetail: {
                            $ref: "#/components/schemas/ChargeDetail"
                        }
                    },
                    required: ["workspace", "bookingDetail", "chargeDetail"]
                },
                CheckoutResponse: {
                    type: "object",
                    properties: {
                        success: {
                            type: "boolean"
                        },
                        data: {
                            type: "object",
                            properties: {
                                url: {
                                    type: "string"
                                }
                            }
                        }
                    }
                },
                ConfirmBookingResponse: {
                    type: "object",
                    properties: {
                        success: {type: "boolean"},
                        data: {
                            type: "object",
                            properties: {
                                bookingReference: {type: "string"},
                                bookingData: {
                                    type: "object",
                                    properties: {
                                        booking_id: {type: "integer"},
                                        bookingReference: {type: "string"},
                                        start_date: {type: "string", format: "date-time"},
                                        end_date: {type: "string", format: "date-time"},
                                        booking_date: {type: "string", format: "date-time"},
                                        no_of_space: {type: "integer"},
                                        totalAmount: {type: "number"},
                                        taxAmount: {type: "number"},
                                        grandTotal: {type: "number"},
                                        status: {type: "string"},
                                        workspace_id: {type: "integer"},
                                        user_id: {type: "integer"},
                                        user: {$ref: "#/components/schemas/User"},
                                        workspace: {$ref: "#/components/schemas/Workspace"}
                                    }
                                },
                                paymentData: {
                                    type: "object",
                                    properties: {
                                        billing_details: {$ref: "#/components/schemas/BillingDetails"},
                                        card_details: {$ref: "#/components/schemas/CardDetails"}
                                    }
                                }
                            }
                        }
                    }
                },
                User: {
                    type: "object",
                    properties: {
                        user_id: {type: "integer"},
                        first_name: {type: "string"},
                        last_name: {type: "string"},
                        email: {type: "string"},
                        mobile: {type: "string", nullable: true}
                    }
                },
                WorkspaceBooked: {
                    type: 'object',
                    properties: {
                        workspace_id: {type: 'integer'}
                    }
                },
                BillingDetails: {
                    type: "object",
                    properties: {
                        address: {
                            type: "object",
                            properties: {
                                city: { type: "string" },
                                country: { type: "string" },
                                line1: { type: "string" },
                                line2: { type: "string" },
                                postal_code: { type: "string" },
                                state: { type: "string" }
                            }
                        },
                        email: { type: "string" },
                        name: { type: "string" },
                        phone: { type: "string", nullable: true }
                    }
                },
                CardDetails: {
                    type: "object",
                    properties: {
                        type: { type: "string" },
                        brand: { type: "string" },
                        card_number: { type: "string" }
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