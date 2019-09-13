import * as dotenv from 'dotenv'
import * as Joi from '@hapi/joi'

import * as fs from 'fs'

export interface EnvConfig {
  [key: string]: string;
}

export class ConfigService {

  private readonly envConfig: { [key: string]: string }

  constructor() {
    const config = dotenv.parse(fs.readFileSync('.env'))

    this.envConfig = this.validateInput(config)

  }

  /**
   * Get a key from the config
   *
   * @param {string} key
   */
  get(key: string): string {
    return this.envConfig[key] || ''
  }

  /**
   * Get the correct formatted database uri
   */
  get databaseUri(): string {
    const uri = new URL(
      `mongodb://${this.get('MONGO_USER')}:${this.get('MONGO_PASS')}@${this.get('MONGO_URI')}:${this.get('MONGO_PORT')}/${this.get('MONGO_DATABASE')}`
    )

    console.log('databaseUri', uri.href)

    return uri.href
  }

  /**
   * Ensures all needed variables are set, and returns the validated JavaScript object
   * including the applied default values.
   */
  private validateInput(envConfig: EnvConfig): EnvConfig {
    const envVarsSchema: Joi.ObjectSchema = Joi.object({
      NODE_ENV: Joi.string()
      // .valid(['development', 'production', 'test', 'provision'])
        .default('development'),

      PORT: Joi.number()
        .default(3000),

      MONGO_USER: Joi.string()
        .optional(),

      MONGO_PASS: Joi.string()
        .optional(),

      MONGO_URI: Joi.string()
        .default('127.0.0.1'),

      MONGO_PORT: Joi.number()
        .default('27017'),

      MONGO_DATABASE: Joi.string()
        .required(),

      SCRAPER_URL: Joi.string()
        .required()
    })

    const { error, value: validatedEnvConfig } = envVarsSchema.validate(envConfig)

    if (error) {
      throw new Error(`Config validation error: ${error.message}`)
    }

    return validatedEnvConfig
  }
}
