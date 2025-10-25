'use client';

import * as React from 'react';

import './test.pdf.css'; // Ensure this file is correctly imported

interface DataTable {
  header: {
    'Nome do Cliente': string;
    'CPF/CNPJ': string;
    'Data / Hora': string;
  };
  data: {
    title: string;
    colunmName: string[];
    rows: string[][];
  }[];
}

export default function Page(): React.JSX.Element {
  const dataMap: DataTable = {
    header: {
      'Nome do Cliente': 'Evaristo',
      'CPF/CNPJ': '146.132.232-12',
      'Data / Hora': '04/08/2024 12:00:00',
    },
    data: [
      {
        title: 'Dados Basicos',
        colunmName: ['Data', 'Tipo Financ.', 'Aval', 'Valor ( R$ )'],
        rows: [
          ['11/05', 'Parcelado', 'Avaliado', '9024,09'],
          ['11/05', 'Parcelado', 'Avaliado', '9024,09'],
        ],
      },
      {
        title: 'Outros Dados',
        colunmName: ['Data', 'Tipo Financ.', 'Aval', 'Valor ( R$ )'],
        rows: [
          ['12/06', 'Parcelado', 'Avaliado', '12034,10'],
          ['12/06', 'Parcelado', 'Avaliado', '12034,10'],
        ],
      },
    ],
  };

  return (
    <div className="pdf-container">
      {/* Header Table */}
      <table>
        <thead>
          <tr>
            <th colSpan={2} className="tr-header">
              DADOS PESSOAIS
            </th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(dataMap.header).map(([key, value], index) => (
            <tr key={index}>
              <th className="client-info-header">{key}</th>
              <td>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Data Tables */}
      {dataMap.data.map((tableData, index) => (
        <table key={index}>
          <thead>
            <tr>
              <th colSpan={tableData.colunmName.length} className="tr-header">
                {tableData.title.toUpperCase()}
              </th>
            </tr>
            <tr>
              {tableData.colunmName.map((col, colIndex) => (
                <th key={colIndex}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ))}

      {/* Footer */}
      <footer>
        <p>Gerado por Dr. limpa nome</p>
      </footer>
    </div>
  );
}
