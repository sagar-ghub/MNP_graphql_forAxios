const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,

  GraphQLList,
  GraphQLScalarType,
} = require("graphql");

const axios = require("axios");
const BASE_URL = "http://192.168.1.23:3005/";
const findData = () => {
  return "calculation result";
};
const MNPtype = new GraphQLObjectType({
  name: "MNP",
  //We are wrapping fields in the function as we don’t want to execute this until
  //everything is inilized. For example below code will throw an error AuthorType not
  //found if not wrapped in a function
  fields: () => ({
    id: { type: GraphQLID },
    mobile: { type: GraphQLString },
    operator_id: { type: GraphQLString },
    mobile_code: { type: GraphQLString },
    circle_id: { type: GraphQLString },
    circle_code: { type: GraphQLString },
    is_port: { type: GraphQLString },
  }),
});
const PlanType = new GraphQLScalarType({
  name: "PlanType",
  description: "A custom scalar type",
  serialize(value) {
    return value;
  },
  parseValue(value) {
    return JSON.parse(value);
  },
  parseLiteral(ast) {
    // Convert incoming AST to JSON
    return JSON.parse(ast.value);
  },
});

const getPlan = async (args) => {
  console.log(args);
  console.log(args.amount);
  const url = args.amount
    ? `${BASE_URL}mobile/checkAmount?operator_id=${args.operator_id}&circle_id=${args.circle_id}&amount=${args.amount}`
    : `${BASE_URL}mobile/checkAmount?operator_id=${args.operator_id}&circle_id=${args.circle_id}`;

  console.log(url);
  const { data } = await axios(
    // `${BASE_URL}mobile/checkAmount?operator_id=${args.operator_id}&circle_id=${args.circle_id}`,
    url,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + args.token,
      },
    }
  );
  // console.log("da", data);

  return data.data;
};

//design a mutation to add money to wallet in userschema

const SpecialPlanType = new GraphQLObjectType({
  name: "SpecialPlan",
  fields: () => ({
    amount: { type: GraphQLString },
    validity: { type: GraphQLString },
    sms: { type: GraphQLString },
    is_valid: { type: GraphQLString },
    talktime: { type: GraphQLString },
    disclaimer: { type: GraphQLString },
    description: { type: GraphQLString },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    hello: {
      type: GraphQLString,
      resolve: () => findData(),
    },
    MNP: {
      type: MNPtype,
      args: { mobile: { type: GraphQLString }, token: { type: GraphQLString } },
      async resolve(parent, args) {
        console.log(args);

        const { data } = await axios(
          `${BASE_URL}mobile/getMnpDetails?mobile=${args.mobile}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + args.token,
            },
          }
        );
        // console.log("da", data);

        // console.log(data);
        return data.data;
      },
    },
    PlanAmount: {
      type: SpecialPlanType,
      args: {
        token: { type: GraphQLString },
        operator_id: { type: GraphQLString },
        circle_id: { type: GraphQLString },
        amount: { type: GraphQLString },
      },
      async resolve(parent, args) {
        console.log(args);
        const data = await getPlan(args);

        return data;
      },
    },

    Plans: {
      type: PlanType,
      args: {
        token: { type: GraphQLString },
        operator_id: { type: GraphQLString },
        circle_id: { type: GraphQLString },
      },
      async resolve(parent, args) {
        console.log(args);
        const data = await getPlan(args);

        return data;
      },
    },
  },
});

const schema = new GraphQLSchema({
  query: RootQuery,
});

module.exports = { schema };
