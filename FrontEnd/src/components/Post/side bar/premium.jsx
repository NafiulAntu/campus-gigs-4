import React from "react";

export default function Premium({ onBack }) {
  const plans = [
    {
      name: "Basic",
      price: "Free",
      period: "Forever",
      features: [
        "Create up to 5 posts per day in 7 days",
        "Basic profile customization",
        "Join up to 50 communities",
        "Standard support",
        "Access to public job listings",
      ],
      current: true,
    },
    {
      name: "Pro",
      price: "$9.99",
      period: "per month",
      popular: true,
      features: [
        "Unlimited posts",
        "Advanced profile customization",
        "Join unlimited communities",
        "Priority support",
        "Early access to new features",
        "Blue verification badge",
        "Advanced analytics",
        "Custom profile themes",
      ],
    },
    {
      name: "Enterprise",
      price: "$29.99",
      period: "per month",
      features: [
        "Everything in Pro",
        "Dedicated account manager",
        "Custom integrations",
        "Team collaboration tools",
        "Advanced security features",
        "API access",
        "Custom branding",
        "Priority job listings",
      ],
    },
  ];

  const benefits = [
    {
      icon: "fi fi-br-shield-check",
      title: "Verified Badge",
      desc: "Stand out with a blue checkmark on your profile",
      color: "text-blue-400",
    },
    {
      icon: "fi fi-br-chart-line-up",
      title: "Analytics",
      desc: "Track your profile views and post engagement",
      color: "text-green-400",
    },
    {
      icon: "fi fi-br-sparkles",
      title: "Premium Features",
      desc: "Access exclusive tools and customization options",
      color: "text-yellow-400",
    },
    {
      icon: "fi fi-br-headset",
      title: "Priority Support",
      desc: "Get help faster with dedicated support",
      color: "text-purple-400",
    },
  ];

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="mb-6 h-9 w-9 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
        >
          <i className="fi fi-br-arrow-left text-white text-xl"></i>
        </button>
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Upgrade to <span className="text-primary-teal">Premium</span>
          </h1>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">
            Unlock powerful features and take your Campus Gigs experience to the
            next level
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {benefits.map((benefit, idx) => (
            <div
              key={idx}
              className="bg-white/[0.04] rounded-xl p-6 hover:bg-white/[0.06] transition-colors"
            >
              <div
                className={`h-12 w-12 rounded-lg bg-white/[0.04] flex items-center justify-center ${benefit.color} mb-4`}
              >
                <i className={`${benefit.icon} text-2xl`}></i>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                {benefit.title}
              </h3>
              <p className="text-sm text-text-muted">{benefit.desc}</p>
            </div>
          ))}
        </div>

        {/* Pricing Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`rounded-xl p-6 ${
                plan.popular
                  ? "bg-gradient-to-br from-primary-teal/20 to-blue-500/20 border-2 border-primary-teal"
                  : "bg-white/[0.04]"
              } relative`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 bg-primary-teal text-white text-sm font-bold rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              {plan.current && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 bg-green-500 text-white text-sm font-bold rounded-full">
                    Current Plan
                  </span>
                </div>
              )}

              <div className="text-center mb-6 pt-2">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {plan.name}
                </h3>
                <div className="mb-2">
                  <span className="text-4xl font-bold text-white">
                    {plan.price}
                  </span>
                  {plan.price !== "Free" && (
                    <span className="text-text-muted ml-1">/{plan.period}</span>
                  )}
                </div>
                {plan.price === "Free" && (
                  <span className="text-text-muted">{plan.period}</span>
                )}
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-white">
                    <i className="fi fi-br-check text-primary-teal mt-1"></i>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 rounded-lg font-bold transition-all ${
                  plan.current
                    ? "bg-white/[0.04] text-text-muted cursor-not-allowed"
                    : plan.popular
                    ? "bg-gradient-to-r from-primary-teal to-blue-500 text-white hover:opacity-90"
                    : "bg-white/[0.04] text-white hover:bg-white/10"
                }`}
                disabled={plan.current}
              >
                {plan.current ? "Current Plan" : `Upgrade to ${plan.name}`}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              {
                q: "Can I cancel my subscription anytime?",
                a: "Yes, you can cancel your subscription at any time. Your premium features will remain active until the end of your billing period.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards, PayPal, and bank transfers for Enterprise plans.",
              },
              {
                q: "Is there a refund policy?",
                a: "Yes, we offer a 30-day money-back guarantee if you're not satisfied with your premium subscription.",
              },
              {
                q: "Can I upgrade or downgrade my plan?",
                a: "Absolutely! You can change your plan at any time from your account settings.",
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="bg-white/[0.04] rounded-xl p-6 hover:bg-white/[0.06] transition-colors"
              >
                <h3 className="text-lg font-semibold text-white mb-2">
                  {faq.q}
                </h3>
                <p className="text-text-muted">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 bg-gradient-to-r from-primary-teal to-blue-500 rounded-xl p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to get started?
          </h2>
          <p className="text-white/80 mb-6 max-w-2xl mx-auto">
            Join thousands of professionals who are already using Campus Gigs
            Premium to advance their careers
          </p>
          <button className="px-8 py-3 bg-white text-primary-teal rounded-lg font-bold hover:bg-white/90 transition-colors">
            Start Your Free Trial
          </button>
        </div>
      </div>
    </div>
  );
}
