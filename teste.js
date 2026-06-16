const bcrypt = require('bcryptjs');

const hash = '$2b$10$DO6onHt8ESxBWT.s.EnbxeIhxY2EEaVVZLc.AoRPsiKcz64ziDfu6';
const senha = '123456';

bcrypt.compare(senha, hash).then(resultado => {
    console.log('Resultado da comparação:', resultado);
});