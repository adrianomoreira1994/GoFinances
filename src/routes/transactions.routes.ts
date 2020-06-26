import { Router } from 'express';
import multer from 'multer';
import uploadConfig from '../config/upload';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();
const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = new TransactionsRepository();

  const transactions = await transactionsRepository.all();
  const balance = await transactionsRepository.getBalance();

  const data = {
    transactions,
    balance,
  };

  return response.json(data);
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  const transactionService = new CreateTransactionService();

  const transaction = await transactionService.execute({
    title,
    value,
    type,
    category,
  });

  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const deleteTransactionService = new DeleteTransactionService();

  await deleteTransactionService.execute({ id: request.params.id });

  return response.status(204).json();
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const service = new ImportTransactionsService();
    const importedTransactions = await service.execute({
      filenameCsv: request.file.filename,
    });

    importedTransactions.forEach(async transaction => {
      const { title, value, type, category_id: category } = transaction;

      const transactionService = new CreateTransactionService();

      await transactionService.execute({
        title,
        value,
        type,
        category,
      });
    });

    return response.json(importedTransactions);
  },
);

export default transactionsRouter;
