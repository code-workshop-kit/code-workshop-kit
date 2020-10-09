const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Where do you live? ', country => {
  console.log(`You are a citizen of ${country}`);
  rl.close();
});

rl.on('close', function () {
  process.exit(0);
});
