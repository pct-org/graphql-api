import { ArgsType, Field } from 'type-graphql'

@ArgsType()
export class DownloadArgs {

  @Field({ defaultValue: 'Id of the download.' })
  _id: string

}
