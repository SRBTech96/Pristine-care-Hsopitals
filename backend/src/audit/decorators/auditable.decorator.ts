import { SetMetadata } from '@nestjs/common';

export const AUDITABLE_KEY = 'auditable';
export function Auditable(_action?: string): MethodDecorator & ClassDecorator {
	return SetMetadata(AUDITABLE_KEY, true);
}
