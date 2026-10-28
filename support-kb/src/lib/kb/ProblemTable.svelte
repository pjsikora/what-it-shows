<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { causeOf, uniqueById, type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';

  // One row per problem in a merged ticket. A report the desk read as a one-day move
  // (desk-notes.json) is its own problem: no month and day swap in it, so neither cause fits.
  type Problem = 'parser' | 'hint' | 'one-day move' | 'unplaced';
  let { ticket, issues = {} }: { ticket: number; issues?: Partial<Record<Problem, string>> } = $props();

  const merged = $derived(uniqueById(reports as Report[]).filter((r) => r.mergedInto === ticket));
  const problemOf = (r: Report): Problem =>
    notes.oneDayMove.includes(r.id) ? 'one-day move' : (causeOf(r, tenantOf(r)) ?? 'unplaced');

  const rows = $derived.by(() => {
    const by = new Map<Problem, Report[]>();
    for (const r of merged) by.set(problemOf(r), [...(by.get(problemOf(r)) ?? []), r]);
    return [...by.entries()]
      .map(([problem, rs]) => {
        const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
        return {
          problem,
          reports: rs.length,
          tenants: new Set(rs.map((r) => r.tenant)).size,
          firstSeen: days[0],
          lastSeen: days[days.length - 1],
        };
      })
      .sort((a, b) => b.reports - a.reports);
  });
  const exported = (reports as Report[]).length;
</script>

<p class="sum">
  <strong>{merged.length}</strong> reports in #{ticket} ({exported} rows in the export, counted once per id) ·
  <strong>{rows.length}</strong>
  {rows.length === 1 ? 'problem' : 'problems'}
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>tenants</th><th>seen</th><th>ticket</th></tr>
  </thead>
  <tbody>
    {#each rows as row (row.problem)}
      <tr>
        <td><code>{row.problem}</code></td>
        <td>{row.reports}</td>
        <td>{row.tenants}</td>
        <td>{row.firstSeen} → {row.lastSeen}</td>
        <td>
          {#if issues[row.problem]}<a href={issues[row.problem]}>{issues[row.problem]?.replace(/^https:\/\/github\.com\/(.+)\/issues\/(\d+)$/, '$1#$2')}</a>
          {:else}none yet{/if}
        </td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  .sum { font-size: 1.1rem; }
</style>
