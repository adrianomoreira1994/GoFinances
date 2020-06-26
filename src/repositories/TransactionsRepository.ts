import { EntityRepository, Repository, getRepository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async all(): Promise<Transaction[]> {
    const repository = getRepository(Transaction);

    const transactions = await repository.find();

    return transactions.map(transaction => ({
      ...transaction,
      value: Number(transaction.value),
    }));
  }

  public async getBalance(): Promise<Balance> {
    const transactionRepository = getRepository(Transaction);

    const transactions = await transactionRepository.find();

    let balance: Balance = {
      income: 0,
      outcome: 0,
      total: 0,
    };

    const totalIncome = transactions.reduce((total, transaction) => {
      if (transaction.type === 'income') {
        return total + Number(transaction.value);
      }

      return total;
    }, 0);

    const totalOutcome = transactions.reduce((total, transaction) => {
      if (transaction.type === 'outcome') {
        return total + Number(transaction.value);
      }

      return total;
    }, 0);

    balance = {
      income: totalIncome,
      outcome: totalOutcome,
      total: totalIncome - totalOutcome,
    };

    return balance;
  }
}

export default TransactionsRepository;
