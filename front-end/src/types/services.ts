import { Dayjs } from 'dayjs';

import { ListStatus } from './list';

export interface List {
  createdAt: string | number | Dayjs | Date | null | undefined;
  id: number;
  status: ListStatus; // Status of the service
  protocol: string;
  client: {
    name: string;
    email: string;
    phone: string;
  };
}
