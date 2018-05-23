/**
 * NEVER import like this - import { MyAwesomeFunction, MyAwesomeClass } from ".."; OR import { MyAwesomeFunction, MyAwesomeClass } from ".";
 * ALWAYS import like this - import { MyAwesomeClass } from '../my.awesome.class'; import { MyAwesomeFunction } from '../my.awesome.function';
 * AVOID ".." OR "." import destinations as this confuses typescript. Search and replace "." OR ".." for absolute destinations. Note double quotes were used here to make your search easier
 */
import { Component, BadRequestException } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { MessageCategory, MessageCategoryToken } from 'database';
import {
  IndexSet,
  RepoAllType,
  StitchSet,
  InjectRepo,
  GenericEntityService,
} from 'core';
import { Message } from 'database';

@Component()
export class MessageCategoryService extends GenericEntityService<
  MessageCategory
> {
  constructor(
    @InjectRepo(MessageCategoryToken)
    private readonly messageCategoryRepository: Repository<MessageCategory>,
  ) {
    super('messageCategory', 'name');
  }

  fillWithMessages(
    messageCategory:
      | MessageCategory
      | MessageCategory[]
      | Map<number, MessageCategory>,
    indexedMessages: Map<number, Message>,
  ) {
    StitchSet(
      messageCategory,
      indexedMessages,
      p => p.messages.map(c => c.id),
      (p, c) => (p.messages = c),
    );
  }

  createQueryBuilder() {
    return this.messageCategoryRepository.createQueryBuilder(this.entity);
  }

  applyStems(
    query: SelectQueryBuilder<MessageCategory>,
  ): SelectQueryBuilder<MessageCategory> {
    return query
      .leftJoin(`${this.entity}.messages`, 'message')
      .addSelect('message.id');
  }
}
