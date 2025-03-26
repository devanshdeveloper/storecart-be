const mongoose = require('mongoose');
const { Schema } = mongoose;

const ExampleSchema = new Schema({
  // String types
  title: {
    type: String,
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  email: {
    type: String,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  enum_field: {
    type: String,
    enum: ['option1', 'option2', 'option3']
  },

  // Number types
  age: {
    type: Number,
    min: [0, 'Age must be positive'],
    max: 150
  },
  price: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },

  // Boolean type
  isActive: {
    type: Boolean,
    default: true
  },

  // Date types
  birthDate: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },

  // ObjectId reference
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },

  // Array types
  tags: [String],
  comments: [{
    text: String,
    postedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  }],

  // Mixed type (any data)
  metadata: Schema.Types.Mixed,

  // Image field
  image: {
    filename: String,
    path: String,
    mimetype: String,
    size: Number
  },

  // Nested object
  address: {
    street: String,
    city: String,
    country: String,
    zipCode: String
  },

  // URL field with validation
  website: {
    type: String,
    validate: {
      validator: function(v) {
        return /^(http|https):\/\/[^ "]+$/.test(v);
      },
      message: props => `${props.value} is not a valid URL!`
    }
  }
}, {
  timestamps: true,
  versionKey: false
});

module.exports = mongoose.model('Example', ExampleSchema);