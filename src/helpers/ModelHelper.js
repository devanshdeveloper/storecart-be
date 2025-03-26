class ModelHelper {
  constructor(model) {
    this.model = model;
  }

  // Validation
  validate(data) {
    return this.model.validate(data);
  }

  // READ
  find() {
    return this.model.find();
  }

  findById(id) {
    return this.model.findById(id);
  }

  findOne(query) {
    return this.model.findOne(query);
  }

  // CREATE
  create(data, ...args) {
    return this.model.create(data, ...args);
  }

  createInstance(data, ...args) {
    return new this.model(data, ...args);
  }

  // UPDATE
  update(id, data) {
    return this.model.findByIdAndUpdate(id, data, { new: true });
  }

  findByIdAndUpdate(id, data) {
    return this.model.findByIdAndUpdate(id, data, { new: true });
  }

  findOneAndUpdate(query, data) {
    return this.model.findOneAndUpdate(query, data, { new: true });
  }

  updateMany(query, data) {
    return this.model.updateMany(query, data);
  }

  // DELETE
  delete(id) {
    return this.model.findByIdAndDelete(id);
  }

  findByIdAndDelete(id) {
    return this.model.findByIdAndDelete(id);
  }

  // CUSTOM METHODS
  async paginate({ filter, sort, select }, { page = 1, limit = 10 }) {
    if (page < 1 || limit < 1) {
      throw new Error("Page and limit must be greater than 0");
    }

    // Calculate the start and end index of the documents to return
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const totalDocuments = await this.model.countDocuments(filter);

    let data = null;
    let query = null;
    try {
      query = this.model.find(filter);
      if (sort) {
        query = query.sort(sort);
      }
      if (select) {
        query = query.select(select);
      }
      data = await query.limit(limit).skip(startIndex).lean();
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
    { filter, sort = { name: 1 }, select = "name" },
    { page = 1, limit = 10 }
  ) {
    const paginatedData = await this.paginate(
      {
        filter,
        sort,
        select,
      },
      { page, limit }
    );
    return paginatedData.data.map((item) => ({
      value: item._id,
      label: item[select],
    }));
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
