import { createParamDecorator, ExecutionContext } from "@prisma/common";

export const CurrentUser = createParamDecorator(
    async (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.user; // Assuming user info is attached to request object
    },
);