import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Set "mo:core/Set";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Principal "mo:core/Principal";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  module Product {
    public func compare(product1 : Product, product2 : Product) : Order.Order {
      Nat.compare(product1.id, product2.id);
    };
  };

  type Product = {
    id : Nat;
    name : Text;
    scentNotes : Text;
    price : Nat;
    description : Text;
    collection : Text;
    sizeMl : Nat;
  };

  type Collection = {
    name : Text;
    description : Text;
  };

  type Order = {
    userPrincipal : Text;
    items : [Stripe.ShoppingItem];
    successUrl : Text;
    cancelUrl : Text;
    totalAmount : Nat;
    paymentMethod : Text;
    shippingAddress : Text;
    status : OrderStatus;
    sessionId : Text;
  };

  type OrderStatus = {
    #pending;
    #confirmed;
    #shipped;
    #delivered;
    #canceled;
  };

  public type UserProfile = {
    name : Text;
    email : Text;
    shippingAddress : Text;
  };

  let products = Map.empty<Nat, Product>();
  var nextProductId = 0;

  let collections = Map.empty<Text, Collection>();
  let orders = Map.empty<Nat, Order>();
  let emails = Set.empty<Text>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let sessionToOrder = Map.empty<Text, Nat>();

  var brandStory = "Welcome to Cosec! A perfume brand for teenagers.";
  var nextOrderId = 0;
  var stripeConfiguration : ?Stripe.StripeConfiguration = null;

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Stripe Configuration
  public query func isStripeConfigured() : async Bool {
    stripeConfiguration != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    stripeConfiguration := ?config;
  };

  func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (stripeConfiguration) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  public shared ({ caller }) func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    // Verify the caller owns this session
    switch (sessionToOrder.get(sessionId)) {
      case (null) { Runtime.trap("Session not found") };
      case (?orderId) {
        switch (orders.get(orderId)) {
          case (null) { Runtime.trap("Order not found") };
          case (?order) {
            if (order.userPrincipal != caller.toText() and not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: Can only check your own session status");
            };
          };
        };
      };
    };
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create checkout sessions");
    };

    let userPrincipalText = caller.toText();

    let totalAmount = items.foldLeft(0, func(acc, item) { acc + item.priceInCents * item.quantity });

    let orderId = nextOrderId;
    nextOrderId += 1;

    let sessionId = await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);

    let newOrder : Order = {
      userPrincipal = userPrincipalText;
      items;
      totalAmount;
      paymentMethod = "stripe";
      shippingAddress = "";
      status = #pending;
      successUrl;
      cancelUrl;
      sessionId;
    };

    orders.add(orderId, newOrder);
    sessionToOrder.add(sessionId, orderId);

    sessionId;
  };

  // Product Management (Admin only)
  public shared ({ caller }) func addProduct(product : Product) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add products");
    };

    let productId = nextProductId;
    nextProductId += 1;

    let newProduct : Product = {
      product with
      id = productId;
    };

    products.add(productId, newProduct);
    productId;
  };

  public shared ({ caller }) func addCollection(name : Text, description : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add collections");
    };

    if (collections.containsKey(name)) { Runtime.trap("This collection already exists.") };
    let collection : Collection = {
      name;
      description;
    };
    collections.add(name, collection);
  };

  public shared ({ caller }) func updateBrandStory(story : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update brand story");
    };
    brandStory := story;
  };

  // Public newsletter subscription
  public shared ({ caller = _ }) func subscribeEmail(email : Text) : async () {
    if (emails.contains(email)) { Runtime.trap("This email is already subscribed.") };
    emails.add(email);
  };

  // Product queries (public)
  func getProductInternal(id : Nat) : Product {
    switch (products.get(id)) {
      case (null) { Runtime.trap("Product does not exist") };
      case (?product) { product };
    };
  };

  public query ({ caller = _ }) func getProduct(id : Nat) : async Product {
    getProductInternal(id);
  };

  public query ({ caller = _ }) func getAllProducts() : async [Product] {
    products.values().toArray().sort();
  };

  public query ({ caller = _ }) func getAllCollections() : async [Collection] {
    collections.values().toArray();
  };

  public query ({ caller = _ }) func getBrandStory() : async Text {
    brandStory;
  };

  // Order queries (user can see own orders, admin can see all)
  public query ({ caller }) func getCallerOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };

    let userPrincipalText = caller.toText();
    orders.values().toArray().filter(func(order : Order) : Bool {
      order.userPrincipal == userPrincipalText;
    });
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };
    orders.values().toArray();
  };

  public query ({ caller }) func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };
};
