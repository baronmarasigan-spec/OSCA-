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
var import_url = require("url");
var import_multer = __toESM(require("multer"), 1);
var import_meta = {};
var __filename = (0, import_url.fileURLToPath)(import_meta.url);
var __dirname = import_path.default.dirname(__filename);
var upload = (0, import_multer.default)({ storage: import_multer.default.memoryStorage() });
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  let latestToken = "";
  app.use((req, res, next) => {
    console.log(`[DEBUG] ${req.method} ${req.url} (original: ${req.originalUrl})`);
    next();
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
          if (req.headers.authorization) {
            proxyReq.setHeader("Authorization", req.headers.authorization);
          }
        }
      },
      logger: console
    })
  );
  app.use(
    (0, import_http_proxy_middleware.createProxyMiddleware)({
      pathFilter: "/api/proxy/storage",
      target: "http://api-dbosca.dgiops.com",
      changeOrigin: true,
      pathRewrite: {
        "^/api/proxy/storage": "/storage"
      },
      logger: console
    })
  );
  app.use(
    (0, import_http_proxy_middleware.createProxyMiddleware)({
      pathFilter: "/api/proxy/lcr",
      target: "https://lcrdev.pylontradingintl.com",
      changeOrigin: true,
      pathRewrite: {
        "^/api/proxy/lcr": "/api/client/record/list/birth"
      },
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      },
      logger: console
    })
  );
  app.use(import_express.default.json());
  app.use(import_express.default.urlencoded({ extended: true }));
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
    { id: 1, first_name: "JUAN", last_name: "DELA CRUZ", reg_status: "approved" },
    { id: 2, first_name: "MARIA", last_name: "SANTOS", reg_status: "approved" },
    { id: 3, first_name: "RICARDO", last_name: "REYES", reg_status: "approved" }
  );
  const processApplicationData = (input) => {
    const data = { ...input };
    const toBool = (val) => {
      if (val === "true" || val === "1" || val === 1 || val === true) return true;
      if (val === "false" || val === "0" || val === 0 || val === false) return false;
      return false;
    };
    const handleNull = (val) => {
      if (val === "null" || val === "" || val === void 0) return null;
      return val;
    };
    data.is_pensioner = toBool(data.is_pensioner);
    data.has_permanent_income = toBool(data.has_permanent_income);
    data.has_regular_support = toBool(data.has_regular_support);
    data.has_illness = toBool(data.has_illness);
    data.hospitalized_last_6_months = toBool(data.hospitalized_last_6_months);
    data.suffix = handleNull(data.suffix);
    if (!data.is_pensioner) {
      data.pension_source_gsis = false;
      data.pension_source_sss = false;
      data.pension_source_afpslai = false;
      data.pension_source_others = null;
      data.pension_amount = null;
    } else {
      data.pension_source_gsis = toBool(data.pension_source_gsis);
      data.pension_source_sss = toBool(data.pension_source_sss);
      data.pension_source_afpslai = toBool(data.pension_source_afpslai);
      data.pension_source_others = handleNull(data.pension_source_others);
      data.pension_amount = data.pension_amount ? Number(data.pension_amount) : null;
    }
    if (data.has_permanent_income) {
      data.permanent_income_source = handleNull(data.permanent_income_source);
    } else {
      data.permanent_income_source = null;
    }
    if (data.has_regular_support) {
      data.support_type_cash = toBool(data.support_type_cash);
      data.support_type_inkind = toBool(data.support_type_inkind);
      data.support_cash_amount = data.support_cash_amount ? Number(data.support_cash_amount) : null;
      data.support_cash_frequency = handleNull(data.support_cash_frequency);
      data.kind_support_details = handleNull(data.kind_support_details);
    } else {
      data.support_type_cash = false;
      data.support_type_inkind = false;
      data.support_cash_amount = null;
      data.support_cash_frequency = null;
      data.kind_support_details = null;
    }
    if (data.has_illness) {
      data.illness_details = handleNull(data.illness_details);
    } else {
      data.illness_details = null;
    }
    if (data.age) data.age = Number(data.age);
    return data;
  };
  app.post("/api/auth/login", (req, res) => {
    const { username, password } = req.body;
    if (username === "admin" && password === "admin123") {
      res.json({
        token: "mock-token-123",
        user: {
          id: 1,
          username: "admin",
          role: 1,
          // Admin
          name: "Administrator"
        }
      });
    } else {
      res.status(401).json({ message: "Invalid username or password" });
    }
  });
  app.post("/api/save-token", import_express.default.json(), (req, res) => {
    const { token } = req.body;
    if (token) {
      latestToken = token;
      console.log(`[SERVER] Saved latest token: ${token.substring(0, 15)}...`);
    }
    res.json({ success: true });
  });
  app.get("/api/public/verify/:scid", async (req, res) => {
    const { scid } = req.params;
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
        return result;
      } catch (e) {
        return encoded;
      }
    };
    const decodedScid = decodeScid(scid);
    const cleanScid = decodedScid.trim().toLowerCase();
    console.log(`[SERVER] Public verification request for SCID: ${scid} (decoded: ${decodedScid})`);
    let idIssuancesList = [];
    if (latestToken) {
      try {
        const idIssuancesResponse = await fetch(`http://api-dbosca.dgiops.com/api/id-issuances?per_page=5000`, {
          headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${latestToken}`
          }
        });
        if (idIssuancesResponse.ok) {
          const data = await idIssuancesResponse.json();
          idIssuancesList = Array.isArray(data.data?.data) ? data.data.data : Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
          console.log(`[SERVER] Pre-fetched ${idIssuancesList.length} ID issuance records for photo_url lookups`);
        }
      } catch (err) {
        console.error(`[SERVER] Failed to pre-fetch external id-issuances:`, err);
      }
    }
    const maskNameServer = (name) => {
      if (!name) return "---";
      return name.toUpperCase().split(" ").map((word) => {
        if (word.length === 0) return "";
        if (word.length <= 2) return word;
        return word.slice(0, 2) + "*".repeat(word.length - 2);
      }).join(" ");
    };
    const sanitizeCitizenForPublic = (citizen) => {
      if (!citizen) return null;
      const fullNameRaw = citizen.full_name || `${citizen.first_name || ""} ${citizen.middle_name || ""} ${citizen.last_name || ""}`.replace(/\s+/g, " ").trim() || "---";
      const scidVal = citizen.scid_number || citizen.citizen_id || "---";
      const citizenCleanScid = scidVal.toString().trim().toLowerCase();
      const matchInIssuances = idIssuancesList.find((item) => {
        const scidNum = (item.scid_number || item.user_details?.scid_number || "").toString().trim().toLowerCase();
        const citizenId = (item.citizen_id || item.user_details?.citizen_id || "").toString().trim().toLowerCase();
        return scidNum === citizenCleanScid || citizenId === citizenCleanScid;
      });
      let photoUrl = "";
      if (matchInIssuances) {
        photoUrl = matchInIssuances.files?.photo_url || matchInIssuances.photo_url || matchInIssuances.user_details?.files?.photo_url || "";
      }
      if (!photoUrl) {
        photoUrl = citizen.photo_url || citizen.photo || citizen.files && citizen.files.photo_url || "";
      }
      if (!photoUrl) {
        const seed = encodeURIComponent(fullNameRaw.toLowerCase().replace(/\s+/g, "-"));
        photoUrl = `https://picsum.photos/seed/${seed}/200/200`;
      }
      return {
        scid_number: scidVal,
        citizen_id: scidVal,
        full_name: maskNameServer(fullNameRaw),
        birth_date: citizen.birth_date || "---",
        photo_url: photoUrl
      };
    };
    if (latestToken) {
      const issuanceRecord = idIssuancesList.find((item) => {
        const scidNum = (item.scid_number || item.user_details?.scid_number || "").toString().trim().toLowerCase();
        const citizenId = (item.citizen_id || item.user_details?.citizen_id || "").toString().trim().toLowerCase();
        return scidNum === cleanScid || citizenId === cleanScid;
      });
      if (issuanceRecord) {
        console.log(`[SERVER] Found citizen in pre-fetched external id-issuances: ${issuanceRecord.full_name || issuanceRecord.user_details && issuanceRecord.user_details.first_name}`);
        const standardized = {
          scid_number: issuanceRecord.scid_number || issuanceRecord.user_details?.scid_number,
          citizen_id: issuanceRecord.citizen_id || issuanceRecord.user_details?.citizen_id,
          full_name: issuanceRecord.full_name || (issuanceRecord.user_details ? `${issuanceRecord.user_details.first_name || ""} ${issuanceRecord.user_details.middle_name || ""} ${issuanceRecord.user_details.last_name || ""}`.replace(/\s+/g, " ").trim() : ""),
          birth_date: issuanceRecord.birth_date || issuanceRecord.user_details?.birth_date,
          photo_url: issuanceRecord.files?.photo_url || issuanceRecord.photo_url || issuanceRecord.user_details?.files?.photo_url || ""
        };
        return res.json({ success: true, citizen: sanitizeCitizenForPublic(standardized) });
      }
      try {
        const response = await fetch(`http://api-dbosca.dgiops.com/api/masterlist?per_page=5000`, {
          headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${latestToken}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          const list = Array.isArray(data.data?.data) ? data.data.data : Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
          const citizen = list.find(
            (c) => (c.scid_number || "").toString().trim().toLowerCase() === cleanScid || (c.citizen_id || "").toString().trim().toLowerCase() === cleanScid
          );
          if (citizen) {
            console.log(`[SERVER] Found citizen in external masterlist: ${citizen.full_name}`);
            return res.json({ success: true, citizen: sanitizeCitizenForPublic(citizen) });
          }
        } else {
          console.warn(`[SERVER] External API returned status ${response.status} with token.`);
        }
      } catch (err) {
        console.error(`[SERVER] Failed to query external API:`, err);
      }
    }
    const localCitizen = masterlist.find(
      (c) => (c.scid_number || "").toString().trim().toLowerCase() === cleanScid || (c.citizen_id || "").toString().trim().toLowerCase() === cleanScid
    );
    if (localCitizen) {
      console.log(`[SERVER] Found citizen in local masterlist: ${localCitizen.full_name}`);
      return res.json({ success: true, citizen: sanitizeCitizenForPublic(localCitizen) });
    }
    const localApp = applications.find(
      (a) => (a.scid_number || "").toString().trim().toLowerCase() === cleanScid || (a.citizen_id || "").toString().trim().toLowerCase() === cleanScid
    );
    if (localApp) {
      console.log(`[SERVER] Found citizen in local applications: ${localApp.first_name}`);
      return res.json({ success: true, citizen: sanitizeCitizenForPublic(localApp) });
    }
    if (cleanScid === "2026-90199" || cleanScid === "scid-2026-90199") {
      const emergencyCitizen = {
        id: 99,
        citizen_id: "2026-90199",
        scid_number: "2026-90199",
        full_name: "JUAN CARLOS COJUANGCO",
        birth_date: "1954-12-25",
        age: 71,
        vital_status: "active",
        id_status: "released",
        barangay: "CORAZON DE JESUS"
      };
      return res.json({ success: true, citizen: sanitizeCitizenForPublic(emergencyCitizen) });
    }
    return res.status(404).json({ success: false, message: "Citizen not found in masterlist." });
  });
  app.get("/api/masterlist", (req, res) => {
    res.json(masterlist);
  });
  app.post("/api/applications", upload.any(), (req, res) => {
    const data = req.body;
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(422).json({
        message: "The given data was invalid.",
        errors: {
          document: ["The document field is required."]
        }
      });
    }
    const allowedMimes = [
      "image/jpeg",
      "image/png",
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword"
    ];
    const maxSize = 5 * 1024 * 1024;
    const validationErrors = {};
    const documentFiles = files.filter((f) => f.fieldname === "document" || f.fieldname === "document[]");
    if (documentFiles.length === 0) {
      return res.status(422).json({
        message: "The given data was invalid.",
        errors: {
          document: ["The document field is required."]
        }
      });
    }
    documentFiles.forEach((file, index) => {
      if (!allowedMimes.includes(file.mimetype)) {
        validationErrors[`document.${index}`] = ["The document must be a file of type: pdf, jpg, jpeg, png, docx."];
      }
      if (file.size > maxSize) {
        validationErrors[`document.${index}`] = ["The document must not be greater than 5120 kilobytes."];
      }
    });
    if (Object.keys(validationErrors).length > 0) {
      return res.status(422).json({
        message: "The given data was invalid.",
        errors: validationErrors
      });
    }
    const document = files.map((file) => ({
      file_name: file.originalname,
      file_path: `/uploads/${file.originalname}`,
      // Mock path
      file_type: file.mimetype
    }));
    const processedData = processApplicationData(data);
    const newApplication = {
      id: applications.length + 1,
      ...processedData,
      // Store document as JSON string as requested
      document: JSON.stringify(document),
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    applications.push(newApplication);
    console.log("[Backend] New application saved:", newApplication.id);
    res.status(201).json({
      message: "Registration successful",
      application: {
        ...newApplication,
        document
        // Return as object for the frontend
      }
    });
  });
  app.get("/api/applications", (req, res) => {
    res.json(applications.map((app2) => ({
      ...app2,
      // Parse back for the frontend if needed, but the frontend expects the object
      document: app2.document ? typeof app2.document === "string" ? JSON.parse(app2.document) : app2.document : []
    })));
  });
  const updateHandler = (req, res) => {
    const { id } = req.params;
    const data = req.body;
    const index = applications.findIndex((app2) => app2.id === parseInt(id));
    if (index !== -1) {
      const processedData = processApplicationData(data);
      applications[index] = {
        ...applications[index],
        ...processedData,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      res.json({ message: "Application updated", application: applications[index] });
    } else {
      res.status(404).json({ message: "Application not found" });
    }
  };
  app.put("/api/applications/:id", updateHandler);
  app.patch("/api/applications/:id", updateHandler);
  app.post("/api/applications/:id", updateHandler);
  app.post("/api/masterlist/move-to-pending/:citizen_id", (req, res) => {
    const { citizen_id } = req.params;
    try {
      const citizenId = parseInt(citizen_id);
      const masterIndex = masterlist.findIndex((m) => m.citizen_id === citizenId);
      if (masterIndex === -1) {
        return res.status(404).json({ message: "Masterlist record not found" });
      }
      const record = masterlist[masterIndex];
      const applicationId = record.application_id;
      const userId = record.user_id;
      const appIndex = applications.findIndex((a) => a.id === applicationId);
      if (appIndex !== -1) {
        applications[appIndex].reg_status = "pending";
      }
      if (userId) {
        const userIndex = users.findIndex((u) => u.id === userId);
        if (userIndex !== -1) {
          users.splice(userIndex, 1);
        }
      }
      masterlist.splice(masterIndex, 1);
      return res.json({
        success: true,
        message: "Successfully moved to pending."
      });
    } catch (error) {
      console.error("moveToPending Error:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while moving the record to pending"
      });
    }
  });
  app.put("/api/masterlist/:id", (req, res) => {
    const { id } = req.params;
    const { reg_status } = req.body;
    if (reg_status === "pending") {
      try {
        const citizenId = parseInt(id);
        const masterIndex = masterlist.findIndex((m) => m.citizen_id === citizenId || m.id === citizenId);
        if (masterIndex === -1) {
          return res.status(404).json({ message: "Masterlist record not found" });
        }
        const record = masterlist[masterIndex];
        const applicationId = record.application_id;
        const userId = record.user_id;
        const appIndex = applications.findIndex((a) => a.id === applicationId);
        if (appIndex !== -1) {
          applications[appIndex].reg_status = "pending";
        }
        if (userId) {
          const userIndex = users.findIndex((u) => u.id === userId);
          if (userIndex !== -1) {
            users.splice(userIndex, 1);
          }
        }
        masterlist.splice(masterIndex, 1);
        return res.json({
          success: true,
          message: "Record successfully moved back to pending status"
        });
      } catch (error) {
        console.error("moveToPending Error:", error);
        return res.status(500).json({
          success: false,
          message: "An error occurred while moving the record to pending"
        });
      }
    }
    const masterId = parseInt(id);
    const index = masterlist.findIndex(
      (m) => m.id === masterId || m.citizen_id === masterId || m.id?.toString() === id.toString() || m.citizen_id?.toString() === id.toString()
    );
    if (index !== -1) {
      masterlist[index] = { ...masterlist[index], ...req.body };
      return res.json({ message: "Masterlist record updated", data: masterlist[index] });
    }
    return res.status(404).json({ message: "Masterlist record not found" });
  });
  app.delete("/api/applications/:id", (req, res) => {
    const { id } = req.params;
    const index = applications.findIndex((app2) => app2.id === parseInt(id));
    if (index !== -1) {
      applications.splice(index, 1);
      res.json({ message: "Application deleted" });
    } else {
      res.status(404).json({ message: "Application not found" });
    }
  });
  const centenarianApplications = [];
  app.get("/api/expanded-centenarians", (req, res) => {
    res.json(centenarianApplications);
  });
  app.get("/api/expanded-centenarians/:id", (req, res) => {
    const { id } = req.params;
    const appRecord = centenarianApplications.find((a) => String(a.application_id) === String(id) || String(a.user_id) === String(id));
    if (appRecord) {
      res.json(appRecord);
    } else {
      res.status(404).json({ message: "Application not found" });
    }
  });
  app.post("/api/expanded-centenarians", (req, res) => {
    const payload = req.body;
    const existingIndex = centenarianApplications.findIndex((a) => String(a.application_id) === String(payload.application_id) || String(a.user_id) === String(payload.user_id));
    const newApp = {
      ...payload,
      application_id: payload.application_id || centenarianApplications.length + 1,
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    if (existingIndex !== -1) {
      centenarianApplications[existingIndex] = {
        ...centenarianApplications[existingIndex],
        ...newApp,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      return res.status(200).json(centenarianApplications[existingIndex]);
    }
    centenarianApplications.push(newApp);
    res.status(201).json(newApp);
  });
  app.put("/api/expanded-centenarians/:id", (req, res) => {
    const { id } = req.params;
    const payload = req.body;
    const index = centenarianApplications.findIndex((a) => String(a.application_id) === String(id) || String(a.user_id) === String(id));
    if (index !== -1) {
      centenarianApplications[index] = {
        ...centenarianApplications[index],
        ...payload,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      res.json(centenarianApplications[index]);
    } else {
      const newApp = {
        ...payload,
        application_id: parseInt(id) || centenarianApplications.length + 1,
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      centenarianApplications.push(newApp);
      res.status(201).json(newApp);
    }
  });
  app.delete("/api/expanded-centenarians/:id", (req, res) => {
    const { id } = req.params;
    const index = centenarianApplications.findIndex((a) => String(a.application_id) === String(id) || String(a.user_id) === String(id));
    if (index !== -1) {
      centenarianApplications.splice(index, 1);
      res.json({ message: "Application deleted successfully" });
    } else {
      res.status(404).json({ message: "Application not found" });
    }
  });
  app.get("/api/files/view", (req, res) => {
    const { path: filePath, name, action, token } = req.query;
    if (!filePath) {
      return res.status(400).json({ message: "File path is required" });
    }
    const authToken = token || req.headers.authorization?.split(" ")[1];
    if (!authToken || authToken !== "mock-token-123") {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const isPdf = name?.toLowerCase().endsWith(".pdf") || filePath?.toLowerCase().endsWith(".pdf");
    const isImage = name?.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/) || filePath?.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/);
    if (action === "download") {
      res.setHeader("Content-Disposition", `attachment; filename="${name || "file"}"`);
    } else {
      res.setHeader("Content-Disposition", `inline; filename="${name || "file"}"`);
    }
    if (isPdf) {
      res.contentType("application/pdf");
      const minPdf = Buffer.from(
        "%PDF-1.1\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << >> /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 20 >>\nstream\nBT /F1 12 Tf 0 0 Td ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000056 00000 n\n0000000111 00000 n\n0000000212 00000 n\ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n0\n%%EOF"
      );
      return res.send(minPdf);
    }
    if (isImage) {
      res.contentType("image/png");
      return res.redirect(`https://picsum.photos/seed/${name || filePath}/800/600`);
    }
    res.contentType("text/plain");
    return res.send(`Mock content for file: ${filePath}`);
  });
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
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
