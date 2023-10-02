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
            schemas: {
                RegisterRequest: {
                    type: 'object',
                    properties: {
                        first_name: { type: 'string' },
                        last_name: { type: 'string' },
                        email: { type: 'string' },
                        password: { type: 'string' }
                    },
                    required: ['first_name', 'last_name', 'email', 'password']
                }
            }
        },
        servers: [
            {
                url: "/",
            },
        ],
    },
    apis: ["./routes/*.ts"],
};