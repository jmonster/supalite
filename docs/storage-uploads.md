# Filesystem Storage uploads

The two CLI filesystem adapters write uploads directly into a unique, exclusively created file beside the destination. They compute the existing MD5 incrementally, close the staging file, prepare metadata, then publish by rename. Existing destination permission bits are preserved. No whole-file concatenation, reread, parser dependency, or request spool is added. Already-materialized `Uint8Array` and `Buffer` bodies are not copied in full again.

Both the Web sink and filesystem write stream have 256 KiB byte budgets. The Web sink charges each entry at least 64 KiB, also limiting tiny or empty chunks to four queued entries while a write is stalled. The standard filesystem write stream batches writes and retries partial writes. With a 64 KiB generated source and a delayed sink, tests verify destination progress before source EOF and at most 640 KiB of produced-but-not-completed bytes. This bound is for the tested source and adapter queues, not arbitrary producer chunks or total process RSS.

Before publication, source, setup, write, close, and rename failures reject the upload, release/cancel its input, close the owned staging file, and remove it. Existing destination bytes survive failed replacement. Cleanup failures are reported alongside the upload error. Concurrent successful uploads publish complete files; the last rename wins rather than interleaving writer bytes.

## Boundaries

- Multipart request parsing still eagerly buffers in core. SDK `File`/`Blob` uploads retain that request-sized memory cost; this is an adapter improvement, not end-to-end bounded SDK upload memory.
- Configured service limits and request-abort propagation are unchanged. The adapter responds to errors/cancellation reaching its input stream; it does not receive the HTTP request's abort signal directly.
- Atomic rename is filesystem publication, not a filesystem/database transaction. A later database failure can still leave published bytes and database metadata out of sync.
- Replacement temporarily needs space for both old and new files. A process crash can leave a `.upload-*` file. This does not add automatic cleanup or promise fsync/power-loss durability.
- Qualification covers Node 24 and Bun 1.3.11/1.4.2 on Linux. It does not establish every runtime, filesystem, or operating system's behavior.

Tests exercise both shipped adapters, source and sink failures including a stalled source, failed replacements, exact bytes/MD5/metadata, empty input, concurrent publication, byte backpressure, and real SDK File/Blob/signed-upload operations. Node-specific fault injection also verifies partial scalar and vector writes.

## Measured tradeoff

A private Linux/Node 24.19.0 comparison against PR31 used five fresh processes per implementation and size, generated 64 KiB chunks, a disk-backed destination, a 1 MiB warmup, and default GC. At 64 MiB, median additional sampled RSS fell from 128.0 to 53.8 MiB and external memory from 128.0 to 54.3 MiB; median upload time increased from 160.7 to 165.2 ms. Median time increased by 3.7%, 7.6%, and 2.8% at 8, 32, and 64 MiB. These synthetic adapter results have scheduling/GC variation and exclude multipart parsing; they show a memory/latency tradeoff, not a fixed process-memory budget or universal speedup.
