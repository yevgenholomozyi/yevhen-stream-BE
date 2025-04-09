import { DynamicModule, Module } from '@nestjs/common'
import { StripeOptionsSymbol, TypeStripeAsyncOptions, TypeStripeOptions } from '@/src/shared/types/stripe.type';
import { StripeService } from './stripe.service';

@Module({})
export class StripeModule {
    public static register(options: TypeStripeOptions): DynamicModule {
        return {
            module: StripeModule,
            providers: [
                {
                    provide: StripeOptionsSymbol,
                    useValue: options,
                },
                StripeService,
            ],
            exports: [StripeService],
            global: true,
        }
    }

    public static registerAsync(options: TypeStripeAsyncOptions): DynamicModule {
        return {
			module: StripeModule,
			imports: options.imports || [],
			providers: [
				{
					provide: StripeOptionsSymbol,
					useFactory: options.useFactory,
					inject: options.inject || []
				},
				StripeService
			],
			exports: [StripeService],
			global: true
		}
    }
}
