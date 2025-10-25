// utils/dayjs-config.ts
import dayjsBase from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

import 'dayjs/locale/pt-br';

dayjsBase.extend(utc);
dayjsBase.extend(timezone);
dayjsBase.extend(localizedFormat);
dayjsBase.extend(relativeTime);

dayjsBase.locale('pt-br');
dayjsBase.tz.setDefault('America/Sao_Paulo');

// Wrapper para aplicar fuso horário e idioma pt-br automaticamente
const dayjs = (date?: dayjsBase.ConfigType) => {
  return dayjsBase.tz(date).locale('pt-br');
};

Object.assign(dayjs, dayjsBase); // Copia métodos estáticos como `isDayjs`, `unix`, etc.

export default dayjs;
