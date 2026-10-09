import { main } from './import-substack.mts';

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
