import { getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionRepository = getRepository(Transaction);
    const repository = new TransactionRepository();

    const balance = await repository.getBalance();

    if (type === 'outcome' && value > balance.total) {
      throw new AppError('You do not have enough balance', 400);
    }

    const categoryRepository = getRepository(Category);

    const categoryExists = await categoryRepository.findOne({
      where: { title: category },
    });

    let category_id = '';
    let createdCategory = new Category();

    if (categoryExists) {
      category_id = categoryExists.id;
    } else {
      createdCategory = categoryRepository.create({
        title: category,
      });

      await categoryRepository.save(createdCategory);
      category_id = createdCategory.id;
    }

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category_id,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
