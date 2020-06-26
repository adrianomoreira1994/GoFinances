import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';

import { getRepository } from 'typeorm';
import Transaction from '../models/Transaction';

import uploadConfig from '../config/upload';

interface Request {
  filenameCsv: string;
}

class ImportTransactionsService {
  async execute({ filenameCsv }: Request): Promise<Transaction[]> {
    const folderFileCsv = path.join(uploadConfig.directory, filenameCsv);

    const readCSVStream = fs.createReadStream(folderFileCsv);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const lines: any[] = [];
    const transactions: Transaction[] = [];

    parseCSV.on('data', line => {
      lines.push(line);
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    lines.forEach(item => {
      const transaction = new Transaction();
      transaction.title = String(item[0]);
      transaction.type = item[1] === 'income' ? 'income' : 'outcome';
      transaction.value = Number(item[2]);
      transaction.category_id = String(item[3]);

      transactions.push(transaction);
    });

    return transactions;
  }
}

export default ImportTransactionsService;
