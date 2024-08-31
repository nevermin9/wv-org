import { ClientRequest, IncomingMessage, createServer } from "node:http";
import { URLSearchParams } from "node:url";
import { resolve } from "node:path";
import pug from "pug"
import { createReadStream } from "node:fs";
import engine from "./nunj"
// find . -name "*.ts" | entr -r tsc --noEmit -p ./apps/wv-ssr/tsconfig.json

/**
 * - remove extra deps
 * - read svelte source, how they handle folder based routing
 */

const __dirname = new URL(".", import.meta.url).pathname;
const templatesDir = resolve(__dirname, "./templates");

const create_render = (basePath: string) => {
  return (name: string, context: Record<string, any>) => {
    //const options = { cache: true } only in production
    return pug.renderFile(`${basePath}/${name}.pug`, { ...context }, (err, html) => {
      if (err) {
        console.error(err);
        return;
      }
      return html;
    });
  };
};

const render = create_render(templatesDir);

const AuthForm = {
  read: async (req: IncomingMessage): Promise<URLSearchParams> => {
    const buffer = [];
    for await (const chunk of req) {
      buffer.push(chunk);
    }
    const body = Buffer.concat(buffer).toString();
    return new URLSearchParams(body);
  },
};

interface FormReader {
  read(): Promise<URLSearchParams>;
}

interface Route {
  path: string;
  method: string;
  reader?: FormReader;
  sender?: (req: IncomingMessage, res: ClientRequest) => void;
}

const userData = {
  name: "John Doe",
  email: "john.doe@gmail.com",
  balance: "1239904.42",
};

const records = [
  {
    id: 1,
    category: "food",
    subcategory: "groceries",
    amount: "-45.60",
    timestamp: "2023-03-01T10:15:30Z",
  },
  {
    id: 2,
    category: "food",
    subcategory: "restaurant, fast-food",
    amount: "-78.20",
    timestamp: "2023-03-02T12:20:45Z",
  },
  {
    id: 3,
    category: "food",
    subcategory: "cafe, bar",
    amount: "-33.40",
    timestamp: "2023-03-03T08:30:50Z",
  },
  {
    id: 4,
    category: "entertainment",
    subcategory: "alcohol, tobacco",
    amount: "-55.30",
    timestamp: "2023-03-04T14:45:20Z",
  },
  {
    id: 5,
    category: "entertainment",
    subcategory: "traveling",
    amount: "-120.00",
    timestamp: "2023-03-05T16:50:25Z",
  },
  {
    id: 6,
    category: "entertainment",
    subcategory: "outdoor",
    amount: "-90.10",
    timestamp: "2023-03-06T18:05:30Z",
  },
  {
    id: 7,
    category: "housing",
    subcategory: "rent",
    amount: "-200.00",
    timestamp: "2023-03-07T20:10:35Z",
  },
  {
    id: 8,
    category: "housing",
    subcategory: "utilities",
    amount: "-75.00",
    timestamp: "2023-03-08T22:25:40Z",
  },
  {
    id: 9,
    category: "housing",
    subcategory: "repairings",
    amount: "-150.50",
    timestamp: "2023-03-09T10:00:00Z",
  },
  {
    id: 10,
    category: "food",
    subcategory: "groceries",
    amount: "-60.70",
    timestamp: "2023-03-10T11:15:10Z",
  },
  {
    id: 11,
    category: "food",
    subcategory: "restaurant, fast-food",
    amount: "-45.90",
    timestamp: "2023-03-11T12:30:20Z",
  },
  {
    id: 12,
    category: "food",
    subcategory: "cafe, bar",
    amount: "-80.20",
    timestamp: "2023-03-12T13:45:30Z",
  },
  {
    id: 13,
    category: "entertainment",
    subcategory: "alcohol, tobacco",
    amount: "-35.40",
    timestamp: "2023-03-13T14:00:40Z",
  },
  {
    id: 14,
    category: "entertainment",
    subcategory: "traveling",
    amount: "-199.99",
    timestamp: "2023-03-14T15:15:50Z",
  },
  {
    id: 15,
    category: "entertainment",
    subcategory: "outdoor",
    amount: "-23.50",
    timestamp: "2023-03-15T16:30:00Z",
  },
  {
    id: 16,
    category: "housing",
    subcategory: "rent",
    amount: "-180.00",
    timestamp: "2023-03-16T17:45:10Z",
  },
  {
    id: 17,
    category: "housing",
    subcategory: "utilities",
    amount: "-60.80",
    timestamp: "2023-03-17T18:00:20Z",
  },
  {
    id: 18,
    category: "housing",
    subcategory: "repairings",
    amount: "-140.60",
    timestamp: "2023-03-18T19:15:30Z",
  },
  {
    id: 19,
    category: "food",
    subcategory: "groceries",
    amount: "-35.30",
    timestamp: "2023-03-19T20:30:40Z",
  },
  {
    id: 20,
    category: "food",
    subcategory: "restaurant, fast-food",
    amount: "-90.90",
    timestamp: "2023-03-20T21:45:50Z",
  },
];

// render and data should be separated
class UserRecord {
  static generateBlank() {
    return {
      id: 0,
      category: "",
      subcategory: "",
      amount: "",
      timestamp: "",
    };
  }

  static generateId() {
    return Math.floor(Math.random() * 100000);
  }

  public id: number;
  public category: string;
  public subcategory: string;
  public amount: string;
  public timestamp: string;

  constructor({ category, subcategory, amount, timestamp }: Record<string, string>) {
    this.id = UserRecord.generateId();
    this.category = category;
    this.subcategory = subcategory;
    this.amount = amount;
    this.timestamp = timestamp;
  }
}

const Records = {
  search: (query: string) => {
    return render("records", {
      title: "Your records",
      records: records.filter((r) => {
        return r.category.toLowerCase().includes(query);
      }),
      query,
    });
  },

  all: () => {
    return render("records", {
      title: "Your records",
      records,
    });
  },

  newRecord: () => {
    return render("new-record", {
      title: "New record",
      record: UserRecord.generateBlank(),
    });
  },

  editRecord: (id: number) => {
    const record = records.find((r) => r.id === id);
    if (!record) {
      return render("404", {
        title: "Record not found",
      });
    }
    return render("edit-record", {
      title: "Edit record",
      record,
    });
  },
};

const readBody = async (req: IncomingMessage) => {
  const buffer = [];
  for await (const chunk of req) {
    console.log({ chunk_plain: chunk });
    console.log({ chunk: chunk.toString() });
    buffer.push(chunk);
  }
  return Buffer.concat(buffer).toString();
};

const server = createServer(async (req, res) => {
  const url = new URL(req.url || "", `http://${req.headers.host}`);
  const pathname = url.pathname;
  const method = req.method?.toUpperCase();
  const body = await readBody(req);

  console.log(`incoming message: ${method} ${url.href}`);
  if (pathname === "/") {
    res.writeHead(308, {
      Location: `/records`,
    });
    res.end();
    return;
  }

  if (pathname === "/nunj") {
    const page = engine.render("index.html", {
      title: "Index",
      name: "Anton",
      tabs: [
        {
          text: "Payments"
        },
        {
          text: "Balances"
        },
        {
          text: "Customers"
        },
        {
          text: "Billings"
        },
      ],
    });
    res.end(page);
    return;
  }

  if (pathname === "/get-greet") {
    res.end(`
      <div class="greet">
         <h2>
            Hello, ${userData.name}!
         </h2>
      </div>
    `);
    return;
  }

  if (pathname === "/get-popover") {
    res.end(render("popover", { title: "Popover title", content: "Popover content" }));
  }

  if (pathname === "/records" && method === "GET") {
    const page = Records.all();
    res.end(page);
    return;
  }

  const search = new URLSearchParams(body);
  if (pathname === "/records" && search.has("q") && method === "POST") {
    const qsearch = search.get("q") || "";
    res.end(Records.search(qsearch));
    return;
  }

  if (pathname === "/records/new" && method === "GET") {
    const page = Records.newRecord();
    res.end(page);
    return;
  }

  if (pathname === "/records/new" && method === "POST") {
    const body = await AuthForm.read(req);
    const recordData = Object.fromEntries(body.entries());
    const record = new UserRecord(recordData);
    records.push(record);
    res.writeHead(303, {
      Location: `/records`,
    });
    res.end();
    return;
  }

  const [path, id] = pathname.split("/").slice(1);
  const numberId = id ? parseInt(id) : 0;
  if (path === "records" && !Number.isNaN(numberId) && numberId && method === "GET") {
    const page = Records.editRecord(numberId);
    res.end(page);
  }

  if (req.url === "/login" && method === "POST") {
    const body = await AuthForm.read(req);
    console.log({ name: body.get("name"), password: body.get("password") });
    res.end("ok");
  }
});

server.listen(3000);
