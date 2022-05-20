/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv').config()
import * as Joi from 'joi'
import { join } from 'path'
import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { ConfigModule } from '@nestjs/config'
import { GraphQLModule } from '@nestjs/graphql'
import { MongooseModule } from '@nestjs/mongoose'
import { MONGO_URI, MONGO_OPTIONS } from '../mongo.config'
import { mongoosePlugin as paginatePlugin } from 'mongo-cursor-pagination'

import { JwtAuthGuard } from './modules/auth/jwt_auth.guard'

import { AuthModule } from './modules/auth/auth.module'
import { TokenModule } from './modules/token/token.module'
import { UserModule } from './modules/user/user.module'
import { RoleModule } from './modules/role/role.module'
import { ClientModule } from './modules/client/client.module'
import { ViewModule } from './modules/view/view.module'
import { MachineryModule } from './modules/machinery/machinery.module'
import { BookingModule } from './modules/booking/booking.module'
import { PubsubModule } from './modules/pubsub/pubsub.module'
import { CounterModule } from './modules/counter/counter.module'
import { ReportModule } from './modules/report/report.module'

@Module( {
    imports: [
        ConfigModule.forRoot( {
            validationSchema: Joi.object( {
                PORT                                           : Joi.number(),
                DB_HOST                                        : Joi.string(),
                DB_PORT                                        : Joi.number(),
                DB_DATABASE                                    : Joi.string(),
                DB_USERNAME                                    : Joi.string(),
                DB_PASSWORD                                    : Joi.string(),
                JWT_TOKEN_SECRET                               : Joi.string().required(),
                JWT_ACCESS_TOKEN_EXPIRATION_TIME_IN_HOURS      : Joi.number().required(),
                JWT_REFRESH_TOKEN_EXPIRATION_TIME_IN_HOURS     : Joi.number().required(),
                CHANGE_PASSWORD_TOKEN_EXPIRATION_TIME_IN_HOURS : Joi.number().required(),
                SMTP_USER                                      : Joi.string().required(),
                SMTP_CLIENT_ID                                 : Joi.string().required(),
                SMTP_CLIENT_SECRET                             : Joi.string().required(),
                SMTP_REDIRECT_URI                              : Joi.string().required(),
                SMTP_REFRESH_TOKEN                             : Joi.string().required(),
            } ),

            isGlobal: true,
        } ),

        GraphQLModule.forRoot( {
            autoSchemaFile              : join(process.cwd(), 'src/schema.gql'),
            context                     : ( { req } ) => ( { req } ),
            playground                  : process.env.NODE_ENV !== 'production',
            installSubscriptionHandlers : true,
            subscriptions               : {
                'subscriptions-transport-ws': {
                    path      : '/graphql',
                    onConnect : (connectionParams) => {

                        return {
                            ...connectionParams,
                        }
                    
                    },
                },
            },
        } ),

        MongooseModule.forRoot(MONGO_URI, {
            ...MONGO_OPTIONS,
            connectionFactory: (connection) => {

                connection.plugin(paginatePlugin)

                return connection
            
            },
        } ),

        AuthModule,
        TokenModule,
        UserModule,
        RoleModule,
        ViewModule,
        ClientModule,
        MachineryModule,
        BookingModule,
        PubsubModule,
        CounterModule,
        ReportModule,
    ],

    controllers : [],
    providers   : [
        {
            provide  : APP_GUARD,
            useClass : JwtAuthGuard,
        },
    ],
} )
export class AppModule {}
