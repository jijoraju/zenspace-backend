export const RegisterRequestSchema = {
    type: 'object',
    properties: {
        first_name: { type: 'string' },
        last_name: { type: 'string' },
        email: { type: 'string' },
        password: { type: 'string' }
    },
    required: ['first_name', 'last_name', 'email', 'password']
};
