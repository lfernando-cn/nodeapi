
Instalar todas as dependencias indicada pelo package.json.
```
npm install
```

Compilar o arquivo TypeScript. Executar o arquivo gerado.
```
npm run start:watch
```

Executar as migrations para criar as tabelas no banco de dados.
```
npx typeorm migration:run -d dist/data-source.js
```

Executar as seeds para cadastrar registro de teste nas tabelas no banco de dados.
```
node dist/run-seeds.js
```

Executar o arquivo gerado com o Node.js
```
node dist/index.js
```

