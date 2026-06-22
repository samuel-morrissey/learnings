# REVIEW.md Format

`REVIEW.md` lives at the workspace root. It is the spaced-review queue: a small table of everything the user has learned and when it should be reviewed next. It exists to beat the forgetting curve — knowledge that is never revisited gets overwritten by what comes after it.

## Template

```md
# Review Queue

| Item | Source | Last reviewed | Next due | Stage |
|------|--------|---------------|----------|-------|
| Closures capture variables, not values | [LR-0003](./learning-records/0003-closures.md) | 2026-06-10 | 2026-06-20 | 2 |
| Flexbox main/cross axis model | [reference/flexbox.html](./reference/flexbox.html) | 2026-06-08 | 2026-07-03 | 3 |
```

## Rules

- **Create lazily.** Start the file when the first lesson is demonstrated, not before.
- **One row per learned item, not per lesson.** An item is a fact, concept or skill compact enough to be tested with one or two retrieval questions. Link to the learning record or reference document that backs it.
- **Stages set the interval.** Stage 1 ≈ 3 days, stage 2 ≈ 10 days, stage 3 ≈ 25 days, stage 4+ ≈ monthly. Guidelines, not a contract — fit the dates to the user's actual session rhythm.
- **Successful review → next stage.** Update `Last reviewed`, bump the stage, set the new due date.
- **Failed review → drop a stage** and set a near-term due date. Repeated failure means the item was never truly learned: re-teach it, and revisit the learning record that claimed it.
- **Review by retrieval.** Ask the user to produce the answer from memory. Never open a review by showing the material again.
- **Retire items** that have survived several monthly reviews or became part of the user's daily practice — remove the row. The queue should stay short enough to scan at the start of every session.
