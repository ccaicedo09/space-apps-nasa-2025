import { generateDescriptionImg } from "../libs/aiClient.js";
import Dataset from "../models/dataset.model.js";

export const getData = async (req, res) => {
    try {
    const {
      created_at,
      created_at_from,
      created_at_to,
      title,
      mission,
      center_latitude,
      center_longitude,
      page = 1,
      limit = 10
    } = req.query;

    let filters = {};

    if (mission) {
      filters.mission = mission;
    }

    if (title) {
      filters.title = { $regex: title, $options: "i" };
    }

    if (created_at_from || created_at_to || created_at) {
      const range = {};

      if (created_at) {
        const d = new Date(created_at);
        if (!isNaN(d)) {
          const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
          const end   = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1, 0, 0, 0, 0));
          range.$gte = start;
          range.$lt  = end;
        }
      }

      if (created_at_from) {
        const from = new Date(created_at_from);
        if (!isNaN(from)) {
          range.$gte = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate(), 0, 0, 0, 0));
        }
      }

      if (created_at_to) {
        const to = new Date(created_at_to);
        if (!isNaN(to)) {
          range.$lt = new Date(Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), to.getUTCDate() + 1, 0, 0, 0, 0));
        }
      }

      if (Object.keys(range).length) {
        filters.created_at = range;
      }
    }

    if (center_latitude) {
      filters.center_latitude = Number(center_latitude);
    }

    if (center_longitude) {
      filters.center_longitude = Number(center_longitude);
    }

    // pagination
    const skip = (page - 1) * limit;

    const [data, totalData] = await Promise.all([
      Dataset.find(filters)
        .skip(skip)
        .limit(Number(limit)),
      Dataset.countDocuments(filters)
    ]);

    const totalPage = Math.ceil(totalData / limit);

    for(const item of data) {
      console.log(item);

      if (!item.description_image) {
        const description = await generateDescriptionImg(item);
        item.description_image = description;
        await item.save();
      }
    }

    return res.json({
      page: Number(page),
      limit: Number(limit),
      totalPage,
      totalData,
      data
    });
  } catch (err) {
    console.error("Error en getData:", err);
    res.status(500).json({ error: "Error al obtener datasets" });
  }
}