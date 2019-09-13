import { NotFoundException } from '@nestjs/common'
import { Args, Query, Mutation, Resolver } from '@nestjs/graphql'

import { StatusService } from './status.service'
import { Status } from './status.object-type'

@Resolver(of => Status)
export class StatusResolver {

  constructor(private readonly statusService: StatusService) {}

  @Query(returns => Status)
  status(): Promise<Status> {
    return this.statusService.getStatus()
  }

}
