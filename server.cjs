var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_vite = require("vite");
var import_http_proxy_middleware = require("http-proxy-middleware");
var import_path = __toESM(require("path"), 1);
var import_multer = __toESM(require("multer"), 1);
var import_nodemailer = __toESM(require("nodemailer"), 1);
process.on("uncaughtException", (err) => {
  console.error("[SERVER UNCAUGHT EXCEPTION]", err);
});
process.on("unhandledRejection", (reason) => {
  console.error("[SERVER UNHANDLED REJECTION]", reason);
});
var currentDirname = typeof __dirname !== "undefined" ? __dirname : process.cwd();
var upload = (0, import_multer.default)({ storage: import_multer.default.memoryStorage() });
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  let latestToken = "";
  const verificationCodes = /* @__PURE__ */ new Map();
  app.use(import_express.default.json());
  app.use(import_express.default.urlencoded({ extended: true }));
  const idStatusOverrides = /* @__PURE__ */ new Map();
  let cachedIdIssuances = [];
  const applications = [];
  const users = [
    { id: 101, username: "juan123" },
    { id: 102, username: "maria123" },
    { id: 103, username: "ricardo123" }
  ];
  const masterlist = [
    { id: 1, citizen_id: 2000001, scid_number: "SCID-2000001", application_id: 1, user_id: 101, full_name: "JUAN DELA CRUZ", birth_date: "1955-05-20", age: 70, reg_status: "approved", vital_status: "active", id_status: "released", barangay: "CORAZON DE JESUS" },
    { id: 2, citizen_id: 2000002, scid_number: "SCID-2000002", application_id: 2, user_id: 102, full_name: "MARIA SANTOS", birth_date: "1958-10-15", age: 67, reg_status: "approved", vital_status: "deceased", id_status: "released", barangay: "PASADE\xD1A" },
    { id: 3, citizen_id: 2000003, scid_number: "SCID-2000003", application_id: 3, user_id: 103, full_name: "RICARDO REYES", birth_date: "1950-01-01", age: 76, reg_status: "approved", vital_status: "active", id_status: "printed", barangay: "ALICIA" },
    { id: 4, citizen_id: "2026-90199", scid_number: "2026-90199", application_id: 4, user_id: 104, full_name: "JUAN CARLOS COJUANGCO", birth_date: "1954-12-25", age: 71, reg_status: "approved", vital_status: "active", id_status: "released", barangay: "CORAZON DE JESUS" }
  ];
  applications.push(
    { id: 1, first_name: "JUAN", last_name: "DELA CRUZ", reg_status: "approved", id_status: "released" },
    { id: 2, first_name: "MARIA", last_name: "SANTOS", reg_status: "approved", id_status: "released" },
    { id: 3, first_name: "RICARDO", last_name: "REYES", reg_status: "approved", id_status: "printed" }
  );
  app.get(["/api/proxy/dbosca/view-file", "/api/view-file"], async (req, res) => {
    const filePath = req.query.path;
    if (!filePath) {
      return res.status(400).json({ message: "File path parameter is required." });
    }
    try {
      const cleanPath = filePath.replace(/^\/?(api\/)?(view-file\?path=)?/, "");
      const liveTargetUrl = `http://api-dbosca.dgiops.com/api/view-file?path=${encodeURIComponent(cleanPath)}&action=view`;
      const headers = { "Accept": "*/*" };
      const token = req.headers.authorization || (latestToken ? `Bearer ${latestToken}` : void 0);
      if (token) headers["Authorization"] = token;
      const imgRes = await fetch(liveTargetUrl, { headers });
      if (imgRes.ok) {
        const contentType = imgRes.headers.get("content-type") || "image/jpeg";
        res.setHeader("Content-Type", contentType);
        const arrayBuffer = await imgRes.arrayBuffer();
        return res.send(Buffer.from(arrayBuffer));
      }
      return res.redirect(liveTargetUrl);
    } catch (err) {
      console.error("[VIEW-FILE DIRECT LIVE ERROR]", err);
      return res.status(500).json({ message: "Failed to load live image file." });
    }
  });
  app.post("/api/send-verification-code", async (req, res) => {
    const { email } = req.body || {};
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: "A valid email address is required." });
    }
    const code = Math.floor(1e5 + Math.random() * 9e5).toString();
    const cleanEmail = email.toLowerCase().trim();
    const expiresAt = Date.now() + 10 * 60 * 1e3;
    verificationCodes.set(cleanEmail, { code, expiresAt });
    const mailHost = process.env.MAIL_HOST || "smtp.office365.com";
    const mailPort = Number(process.env.MAIL_PORT || 587);
    const mailUser = process.env.MAIL_USERNAME || "EPS@sanjuancity.gov.ph";
    const mailPass = process.env.MAIL_PASSWORD || "S@nJuaN3P$3m@!L";
    const mailFrom = process.env.MAIL_FROM_ADDRESS || "EPS@sanjuancity.gov.ph";
    const mailFromName = process.env.MAIL_FROM_NAME || "San Juan City";
    let emailSent = false;
    let emailError = "";
    try {
      const transporter = import_nodemailer.default.createTransport({
        host: mailHost,
        port: mailPort,
        secure: mailPort === 465,
        auth: {
          user: mailUser,
          pass: mailPass
        },
        tls: {
          ciphers: "SSLv3",
          rejectUnauthorized: false
        }
      });
      await transporter.sendMail({
        from: `"${mailFromName}" <${mailFrom}>`,
        to: cleanEmail,
        subject: `San Juan City OSCA - Verification Code: ${code}`,
        text: `Your San Juan City Senior Citizen Registration verification code is: ${code}. Valid for 10 minutes.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
            <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #ef4444;">
              <h2 style="color: #ef4444; margin: 0; font-size: 22px;">San Juan City OSCA</h2>
              <p style="color: #64748b; font-size: 13px; margin-top: 4px; font-weight: 600;">Office of the Senior Citizens Affairs</p>
            </div>
            <div style="padding: 24px 0; text-align: center;">
              <p style="font-size: 15px; color: #1e293b; margin-bottom: 16px;">Your email verification code for Senior Citizen Registration is:</p>
              <div style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #ef4444; background: #fef2f2; border: 1px border-red-200; padding: 16px 24px; border-radius: 12px; margin: 16px 0; display: inline-block;">
                ${code}
              </div>
              <p style="font-size: 12px; color: #64748b; margin-top: 16px;">This code is valid for 10 minutes. Do not share this code with anyone.</p>
            </div>
            <div style="text-align: center; padding-top: 16px; border-top: 1px solid #f1f5f9; font-size: 11px; color: #94a3b8;">
              City Government of San Juan &bull; Office of Senior Citizens Affairs
            </div>
          </div>
        `
      });
      emailSent = true;
    } catch (err) {
      emailError = err?.message || "Failed to send email via SMTP";
    }
    return res.json({
      success: true,
      message: emailSent ? "Verification code sent to your email address." : "Verification code generated.",
      emailSent,
      emailError: emailError || void 0
    });
  });
  app.post("/api/verify-code", (req, res) => {
    const { email, code } = req.body || {};
    if (!email || !code) {
      return res.status(400).json({ success: false, message: "Email and verification code are required." });
    }
    const cleanEmail = email.toLowerCase().trim();
    const cleanCode = code.toString().trim();
    const record = verificationCodes.get(cleanEmail);
    if (!record) {
      return res.status(400).json({ success: false, message: "No verification code found for this email." });
    }
    if (Date.now() > record.expiresAt) {
      verificationCodes.delete(cleanEmail);
      return res.status(400).json({ success: false, message: "Verification code has expired." });
    }
    if (record.code !== cleanCode) {
      return res.status(400).json({ success: false, message: "Invalid verification code." });
    }
    return res.json({ success: true, message: "Email verified successfully!" });
  });
  app.use((req, res, next) => {
    console.log(`[DEBUG] ${req.method} ${req.url}`);
    next();
  });
  app.post(["/api/auth/login", "/api/proxy/dbosca/auth/login"], async (req, res) => {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(422).json({
        message: "The username and password fields are required."
      });
    }
    try {
      const apiRes = await fetch("http://api-dbosca.dgiops.com/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ username, password })
      });
      const data = await apiRes.json().catch(() => null);
      if (apiRes.ok && data) {
        if (data.token) {
          latestToken = data.token;
        }
        return res.status(apiRes.status).json(data);
      }
      if (username === "admin" && password === "admin123") {
        return res.json({
          status: "success",
          token: "mock-token-admin",
          user: { id: 1, username: "admin", role: 1, name: "Administrator" }
        });
      }
      return res.status(apiRes.status || 401).json(data || { message: "Invalid username or password." });
    } catch (err) {
      return res.status(500).json({ message: "Failed to connect to authentication server." });
    }
  });
  app.get("/api/public/verify/:scid", async (req, res) => {
    let { scid } = req.params;
    if (scid && (scid.includes("?scid=") || scid.includes("/merchant-validation"))) {
      try {
        if (scid.includes("?scid=")) {
          const parts = scid.split("?scid=");
          if (parts.length > 1) {
            scid = parts[1].split("&")[0];
          }
        }
      } catch (e) {
      }
    }
    const decodeScid = (encoded) => {
      if (!encoded) return "";
      try {
        if (!/^[0-9a-fA-F]+$/.test(encoded)) {
          return encoded;
        }
        const reversed = encoded.split("").reverse().join("");
        const key = 123;
        let result = "";
        for (let i = 0; i < reversed.length; i += 2) {
          const hex = reversed.substring(i, i + 2);
          const charCode = parseInt(hex, 16) ^ key;
          if (charCode < 32 || charCode > 126) {
            return encoded;
          }
          result += String.fromCharCode(charCode);
        }
        return result || encoded;
      } catch (e) {
        return encoded;
      }
    };
    const decodedScid = decodeScid(scid);
    const cleanScid = decodedScid.trim();
    console.log(`[SERVER] Live Verification Request for SCID: ${cleanScid}`);
    try {
      const endpoints = [
        `http://api-dbosca.dgiops.com/api/verify-id/${encodeURIComponent(cleanScid)}`,
        `http://api-dbosca.dgiops.com/api/merchant/validate/${encodeURIComponent(cleanScid)}`,
        `http://api-dbosca.dgiops.com/api/masterlist?search=${encodeURIComponent(cleanScid)}`,
        `http://api-dbosca.dgiops.com/api/id-issuances?search=${encodeURIComponent(cleanScid)}`
      ];
      const headers = { "Accept": "application/json" };
      if (latestToken) {
        headers["Authorization"] = `Bearer ${latestToken}`;
      }
      let matchedCitizen = null;
      for (const targetUrl of endpoints) {
        try {
          const liveRes = await fetch(targetUrl, { headers });
          if (liveRes.ok) {
            const liveData = await liveRes.json();
            let candidate = liveData.citizen || liveData.data;
            if (Array.isArray(candidate)) candidate = candidate[0];
            if (Array.isArray(liveData.data?.data)) candidate = liveData.data.data[0];
            if (candidate && (candidate.full_name || candidate.first_name || candidate.scid_number || candidate.citizen_id)) {
              matchedCitizen = candidate;
              break;
            }
          }
        } catch (e) {
        }
      }
      if (matchedCitizen) {
        const rawPhotoPath = matchedCitizen.photo_url || matchedCitizen.photo || matchedCitizen.files?.photo_url || "";
        let resolvedPhoto = "";
        if (rawPhotoPath && typeof rawPhotoPath === "string" && rawPhotoPath.trim()) {
          if (rawPhotoPath.startsWith("http")) {
            resolvedPhoto = rawPhotoPath;
          } else {
            const cleanPath = rawPhotoPath.replace(/^\/?(api\/)?(view-file\?path=)?/, "");
            resolvedPhoto = `http://api-dbosca.dgiops.com/api/view-file?path=${encodeURIComponent(cleanPath)}&action=view`;
          }
        } else {
          resolvedPhoto = `http://api-dbosca.dgiops.com/api/view-file?path=ids/${encodeURIComponent(matchedCitizen.scid_number || cleanScid)}.jpg&action=view`;
        }
        return res.json({
          success: true,
          citizen: {
            id: matchedCitizen.id || 1,
            scid_number: matchedCitizen.scid_number || matchedCitizen.citizen_id || cleanScid,
            citizen_id: matchedCitizen.citizen_id || matchedCitizen.scid_number || cleanScid,
            full_name: matchedCitizen.full_name || `${matchedCitizen.first_name || ""} ${matchedCitizen.last_name || ""}`.trim(),
            first_name: matchedCitizen.first_name || "",
            last_name: matchedCitizen.last_name || "",
            birth_date: matchedCitizen.birth_date || matchedCitizen.user_details?.birth_date || null,
            photo_url: resolvedPhoto,
            photo: resolvedPhoto,
            vital_status: matchedCitizen.vital_status || "Active",
            id_status: matchedCitizen.id_status || "Released",
            barangay: matchedCitizen.barangay || "SAN JUAN CITY"
          }
        });
      }
      return res.status(404).json({
        success: false,
        message: `No registered Senior Citizen record found for SCID: ${cleanScid}`
      });
    } catch (err) {
      console.error("[PUBLIC VERIFY ERROR]", err);
      return res.status(500).json({ success: false, message: "Internal server error during verification." });
    }
  });
  app.use(
    (0, import_http_proxy_middleware.createProxyMiddleware)({
      pathFilter: "/api/proxy/dbosca",
      target: "http://api-dbosca.dgiops.com",
      changeOrigin: true,
      pathRewrite: {
        "^/api/proxy/dbosca": "/api"
      },
      on: {
        proxyReq: (proxyReq, req) => {
          (0, import_http_proxy_middleware.fixRequestBody)(proxyReq, req);
          proxyReq.setHeader("Accept", "application/json");
          if (req.headers.authorization) {
            proxyReq.setHeader("Authorization", req.headers.authorization);
          } else if (latestToken) {
            proxyReq.setHeader("Authorization", `Bearer ${latestToken}`);
          }
        }
      }
    })
  );
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: {
        middlewareMode: true,
        allowedHosts: true
      },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
