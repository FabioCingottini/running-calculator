import {
  intro,
  outro,
  isCancel,
  cancel,
  text,
  confirm
} from '@clack/prompts';
import pc from "picocolors"
import {z} from "zod";

function handleControlPlusC(value) {
  if (isCancel(value)) {
    cancel('Operation cancelled');
    return process.exit(0);
  }
}

async function promptText({message, defaultValue, zodValidator, zodValidationErrorMessage}) {
  const rawValue = await text({
    message,
    placeholder: defaultValue,
    initialValue: defaultValue,
    validate(value) {
      const validation = zodValidator.safeParse(value);
      if (!validation.success) return zodValidationErrorMessage;
    },
  });
  handleControlPlusC(rawValue);
  return zodValidator.parse(rawValue);
}

async function main() {
  console.log();
  intro("Welcome to the Running calculator");

  const totWeeks = await promptText({
    message: 'How many weeks you want to calculate?',
    defaultValue: '20',
    zodValidator: z.coerce.number().int().nonnegative().finite().safe(),
    zodValidationErrorMessage: 'Value must be a positive integer number',
  });
  const initialVolume = await promptText({
    message: 'How much volume you want to start with?',
    defaultValue: '20',
    zodValidator: z.coerce.number().int().positive().finite().safe(),
    zodValidationErrorMessage: 'Value must be a positive integer number',
  });
  const incrementPerWeek = await promptText({
    message: 'How much in percentage you want the volume to increment every week?',
    defaultValue: '10',
    zodValidator: z.coerce.number().int().positive().finite().safe(),
    zodValidationErrorMessage: 'Value must be a positive integer number',
  });
  const recoveryWeekInterval = await promptText({
    message: 'How many weeks of work between every recover week',
    defaultValue: '4',
    zodValidator: z.coerce.number().int().nonnegative().finite().safe(),
    zodValidationErrorMessage: 'Value must be a non negative integer number',
  });
  const recoveryWeekDecrement = await promptText({
    message: 'How much in percentage you want the volume to decrement during the recovery week?',
    defaultValue: '10',
    zodValidator: z.coerce.number().int().positive().finite().safe(),
    zodValidationErrorMessage: 'Value must be a positive integer number',
  });
  const shouldRound = await confirm({
    message: 'Do you want to round the volume to the nearest integer?',
    initial: true,
  });

  outro("Here is your plan:");

  let previousVolume = initialVolume;
  for (let i = 0; i < totWeeks; i++) {
    const week = i + 1;
    let volume = previousVolume + (previousVolume * incrementPerWeek / 100);
    if (shouldRound) volume = Math.round(volume);
    console.log(`Week ${week}: ${volume}`);
    if (week % recoveryWeekInterval === 0) {
      let recoveryVolume = volume - (volume * recoveryWeekDecrement / 100);
      if (shouldRound) recoveryVolume = Math.round(recoveryVolume);
      console.log(pc.underline(`Week ${week}: ${recoveryVolume}`));
    }
    previousVolume = volume;
  }

  console.log();

}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  });
