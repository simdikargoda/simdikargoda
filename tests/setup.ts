import { vi } from "vitest";

// `server-only` paketi, Next.js dışındaki (Node) bağlamda import edilince
// bilinçli olarak hata fırlatır. Test ortamında bu modülü boş bir stub ile
// değiştirerek domain/pure servislerin birim testlerinin çalışmasını sağlarız.
vi.mock("server-only", () => ({}));
