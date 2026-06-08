const argon2 = require('argon2');

const pins = process.argv.slice(2);

async function main() {
  if (pins.length === 0) {
    console.log('Uso: npm run hash:pins -- <pin1> <pin2> <pin3>');
    process.exit(0);
  }

  for (const pin of pins) {
    const hash = await argon2.hash(pin);
    console.log(`${pin} => ${hash}`);
  }
}

main().catch((error) => {
  console.error('Error al generar hashes:', error);
  process.exit(1);
});
