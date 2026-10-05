export async function replay(target, groups) {
  for (const group of groups) for (const insert of group.inserts) await target.exec(insert);
  for (const group of groups) for (const reset of group.sequenceResets) await target.exec(reset);
}
