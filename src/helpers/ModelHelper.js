class ModelHelper {
  constructor(model) {
    this.model = model;
  }

  // Validation
  validate(data) {
    return this.model.validate(data);
  }

  // READ
  find(filter, options) {
    return this.buildQuery(this.model.find(filter), options);
  }

  async filter(filter, options = {}) {
    const documents = await this.buildQuery(this.model.find(filter), options);
    if (!documents || documents.length === 0) {
      throw new Error(`No ${this.model.modelName}s found`);
    }
    return documents;
  }

  async filterById(id, options = {}) {
    const document = await this.buildQuery(this.model.findById(id), options);
    if (!document) {
      const error = {
        ...ErrorMap.NOT_FOUND,
        message: `No ${this.model.modelName} found with id ${id}`,
      };
      throw error;
    }
    return document;
  }

  async filterOne(query, options = {}) {
    const document = await this.buildQuery(this.model.findOne(query), options);
    if (!document) {
      throw new Error(
        `No ${this.model.modelName} found with query ${JSON.stringify(query)}`
      );
    }
    return document;
  }

  findById(id, options = {}) {
    return this.buildQuery(this.model.findById(id), options);
  }

  findOne(query, options = {}) {
    return this.buildQuery(this.model.findOne(query), options);
  }

  // CREATE
  create(data, ...args) {
    return this.model.create(data, ...args);
  }

  createInstance(data, ...args) {
    return new this.model(data, ...args);
  }

  // UPDATE
  async update(id, data, options = {}) {
    const document = await this.model.findByIdAndUpdate(id, data, {
      new: true,
      ...options,
    });
    if (!document && !options.upsert) {
      throw new Error(`No ${this.model.modelName} found with id ${id}`);
    }
    return document;
  }

  findByIdAndUpdate(id, data, options) {
    return this.model.findByIdAndUpdate(id, data, { new: true, ...options });
  }

  findOneAndUpdate(query, data, options) {
    return this.model.findOneAndUpdate(query, data, { new: true, ...options });
  }

  updateMany(query, data, options) {
    return this.model.updateMany(query, data, options);
  }

  // DELETE
  async delete(id) {
    const document = await this.model.findByIdAndDelete(id);
    if (!document) {
      const error = {
        ...ErrorMap.NOT_FOUND,
        message: `No ${this.model.modelName} found with id ${id}`,
      };
      throw error;
    }
    return document;
  }

  async softDelete(id) {
    return await this.findByIdAndUpdate(id, { isDeleted: true });
  }

  findByIdAndDelete(id) {
    return this.model.findByIdAndDelete(id);
  }

  countDocuments(filter) {
    return this.model.countDocuments(filter);
  }

  count(filter) {
    return this.countDocuments(filter);
  }

  countByRequest(req) {
    return this.countDocuments({ user: req.user._id });
  }

  /**
   * Builds a MongoDB query with various options
   * @example
   * // Basic query with sorting and field selection
   * buildQuery(User.find(), {
   *   sort: { createdAt: -1 },
   *   select: 'name email -password',
   *   limit: 10
   * })
   *
   * // Advanced population with nested paths
   * buildQuery(Course.find(), {
   *   populate: [
   *     { path: 'instructor', select: 'name email' },
   *     {
   *       path: 'students',
   *       select: 'name grade',
   *       match: { grade: { $gte: 60 } }
   *     }
   *   ]
   * })
   *
   * // Geospatial query with text search
   * buildQuery(Store.find(), {
   *   geoNear: {
   *     near: { type: 'Point', coordinates: [-73.97, 40.77] },
   *     maxDistance: 5000,
   *     spherical: true
   *   },
   *   textSearch: 'coffee shop',
   *   projection: { score: { $meta: 'textScore' } }
   * })
   *
   * // Advanced filtering with regex and date ranges
   * buildQuery(Post.find(), {
   *   regex: { title: '^Top\\s\\d+' },
   *   where: {
   *     createdAt: {
   *       $gte: new Date('2023-01-01'),
   *       $lt: new Date('2024-01-01')
   *     },
   *     'stats.views': { $gt: 1000 }
   *   }
   * })
   */
  buildQuery(
    query,
    {
      sort,
      select,
      populate,
      regex,
      where,
      limit,
      skip,
      lean = false,
      geoNear,
      textSearch,
      projection,
      hint,
      distinct,
      collation,
      readPreference,
    } = {}
  ) {
    if (sort) {
      query = query.sort(sort);
    }

    if (select) {
      query = query.select(select);
    }

    if (projection) {
      query = query.projection(projection);
    }

    if (populate) {
      const populateOptions = Array.isArray(populate) ? populate : [populate];
      populateOptions.forEach((option) => {
        query = query.populate(option);
      });
    }

    if (regex) {
      Object.entries(regex).forEach(([field, pattern]) => {
        query = query.where(field).regex(new RegExp(pattern, "i"));
      });
    }

    if (where) {
      Object.entries(where).forEach(([field, conditions]) => {
        if (typeof conditions === "object") {
          Object.entries(conditions).forEach(([operator, value]) => {
            query = query.where(field)[operator](value);
          });
        } else {
          query = query.where(field, conditions);
        }
      });
    }

    if (geoNear) {
      query = query.near({
        near: geoNear.near,
        maxDistance: geoNear.maxDistance,
        spherical: geoNear.spherical,
      });
    }

    if (textSearch) {
      query = query.where({ $text: { $search: textSearch } });
    }

    if (hint) {
      query = query.hint(hint);
    }

    if (distinct) {
      query = query.distinct(distinct);
    }

    if (collation) {
      query = query.collation(collation);
    }

    if (readPreference) {
      query = query.read(readPreference);
    }

    if (limit) {
      query = query.limit(limit);
    }

    if (skip) {
      query = query.skip(skip);
    }

    if (lean) {
      query = query.lean();
    }

    return query;
  }

  async paginate(filter, { page = 1, limit = 10, ...options }) {
    if (page < 1 || limit < 1) {
      throw new Error("Page and limit must be greater than 0");
    }

    // Calculate the start and end index of the documents to return
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const totalDocumentPromise = this.model.countDocuments(filter);

    try {
      let queryPromise = this.buildQuery(this.model.find(filter), {
        limit,
        skip: startIndex,
        ...options,
      });

      const [totalDocuments, data] = await Promise.all([
        totalDocumentPromise,
        queryPromise,
      ]);

      return {
        data,
        meta: {
          limit,
          page,
          totalDocuments,
          totalPages: Math.ceil(totalDocuments / limit),
          nextPage: endIndex < totalDocuments ? page + 1 : null,
          previousPage: startIndex > 0 ? page - 1 : null,
        },
      };
    } catch (err) {
      throw new Error(err);
    }
  }

  async dropdown(
    filter = {},
    { page = 1, limit = 10, select = "name", ...options }
  ) {
    const paginatedData = await this.paginate(filter, {
      page,
      limit,
      select,
      ...options,
    });
    return {
      ...paginatedData,
      data: paginatedData.data.map((item) => ({
        value: item._id,
        label: item[select],
      })),
    };
  }

  async aggregate(query) {
    return this.model.aggregate(query);
  }

  async paginatedAggregate(pipeline = [], { page = 1, limit = 10 }) {
    if (isNaN(page) || isNaN(limit)) {
      throw new Error("Invalid page or limit");
    }
    if (page < 1 || limit < 1) {
      throw new Error("Page and limit must be greater than 0");
    }

    try {
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;

      // Add pagination stages to the pipeline
      const paginatedPipeline = [
        ...pipeline,
        {
          $facet: {
            docs: [{ $skip: startIndex }, { $limit: limit }],
            totalDocs: [{ $count: "count" }],
          },
        },
        {
          $project: {
            docs: 1,
            totalDocuments: { $arrayElemAt: ["$totalDocs.count", 0] },
            limit: { $literal: limit },
            page: { $literal: page },
            totalPages: {
              $ceil: {
                $divide: [{ $arrayElemAt: ["$totalDocs.count", 0] }, limit],
              },
            },
          },
        },
      ];

      const [result] = await this.model.aggregate(paginatedPipeline);

      // Handle case when no documents are found
      if (!result || !result.totalDocuments) {
        return {
          data: [],
          meta: {
            totalDocuments: 0,
            limit,
            page,
            totalPages: 0,
            nextPage: null,
            previousPage: null,
          },
        };
      }

      return {
        data: result.docs,
        meta: {
          totalDocuments: result.totalDocuments,
          limit: result.limit,
          page: result.page,
          totalPages: result.totalPages,
          nextPage: endIndex < result.totalDocuments ? result.page + 1 : null,
          previousPage: startIndex > 0 ? result.page - 1 : null,
        },
      };
    } catch (err) {
      throw new Error(err);
    }
  }
}
module.exports = ModelHelper;
