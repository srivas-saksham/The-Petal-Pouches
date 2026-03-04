// frontend/src/components/bundle-detail/BundleReviews.jsx

import React, { useState, useMemo } from 'react';
import { Star, ThumbsUp, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDisplayRating, formatRating, formatTimeAgo } from '../../utils/reviewHelpers';

const generateReviews = (productId, averageRating) => {
  const baseSeed = productId ? parseInt(productId.toString().split('').reduce((a, b) => a + b.charCodeAt(0), 0)) : 12345;
  let seedCounter = 0;
  const seededRandom = (min = 0, max = 1) => {
    seedCounter++;
    const x = Math.sin(baseSeed * seedCounter) * 10000;
    const random = x - Math.floor(x);
    return min + random * (max - min);
  };
  const reviewCount = Math.floor(seededRandom(5, 21));
  const firstNames = ['Priya','Rahul','Ananya','Vikram','Sneha','Arjun','Meera','Rohan','Isha','Aditya','Kavya','Sanjay','Divya','Karan','Riya','Amit','Pooja','Nikhil','Simran','Varun','Anjali','Arun','Neha','Sahil','Ritika','Manish','Preeti','Kunal','Tanvi','Harsh'];
  const lastNames = ['Sharma','Patel','Kumar','Singh','Mehta','Gupta','Reddy','Iyer','Malhotra','Kapoor','Nair','Verma','Joshi','Chopra','Pillai','Rao','Desai','Agarwal','Bhatt','Sinha','Kulkarni','Menon','Bose','Shah'];
  const reviewTemplates = {
    5: ["Absolutely loved this! Quality exceeded expectations. {feature}. Highly recommend! 💕","Amazing product! {feature}. Perfect for {occasion}. Will definitely order again!","Excellent quality and beautiful presentation. {feature}. Very satisfied! ✨","This is my second order and equally impressed! {feature}. Great customer service too.","Perfect gift! {feature}. The recipient loved it. Packaging was premium.","Outstanding quality! {feature}. Delivered on time. Worth every penny! 🎁","Superb! {feature}. Better than expected. Highly recommended for {occasion}.","Love it! {feature}. The attention to detail is incredible. Will buy again!","Fantastic product! {feature}. Got so many compliments. Thank you! 💝","Best purchase! {feature}. Quality is top-notch. Perfect for gifting."],
    4: ["Great quality! {feature}. Only wish {minor_issue}. Overall very satisfied.","Good product. {feature}. Delivery was on time. Would recommend.","Nice quality and {feature}. Only 4 stars because {minor_issue}.","Pretty good! {feature}. Could be better if {minor_issue}, but still happy.","Satisfied with the purchase. {feature}. Just {minor_issue}.","Good value for money. {feature}. Minor issue: {minor_issue}.","Quality is nice. {feature}. Would give 5 stars if {minor_issue}.","Decent product. {feature}. Not perfect but good enough."],
    3: ["It's okay. {feature} but {issue}. Average experience.","Decent quality. {feature} however {issue}. Could be better.","Mixed feelings. {positive} but {negative}. Average overall.","Not bad, not great. {feature} though {issue}."]
  };
  const features = ["The quality exceeded expectations","Beautiful packaging and presentation","Fast delivery and secure packing","Exactly as described in pictures","Premium feel and finish","Great attention to detail","Loved the personalization option","Very elegant and classy","Perfect size and weight","Colors are vibrant and beautiful"];
  const occasions = ["birthday gifts","anniversary presents","wedding gifts","festive occasions","special celebrations","corporate gifting","housewarming","personal use"];
  const minorIssues = ["it came in more color options","the packaging was slightly better","delivery was a day late","it included more customization","the size was slightly bigger"];
  const issues = ["delivery took longer than expected","packaging could be improved","color was slightly different from picture","size was smaller than expected"];
  const reviews = [];
  for (let i = 0; i < reviewCount; i++) {
    const rand = seededRandom(0, 100);
    let rating;
    if (averageRating >= 4.5) rating = rand < 70 ? 5 : rand < 95 ? 4 : 3;
    else if (averageRating >= 4.0) rating = rand < 50 ? 5 : rand < 90 ? 4 : 3;
    else rating = rand < 40 ? 5 : rand < 75 ? 4 : 3;
    const firstName = firstNames[Math.floor(seededRandom(0, firstNames.length))];
    const lastName = lastNames[Math.floor(seededRandom(0, lastNames.length))];
    const templates = reviewTemplates[rating];
    let comment = templates[Math.floor(seededRandom(0, templates.length))];
    comment = comment
      .replace('{feature}', features[Math.floor(seededRandom(0, features.length))])
      .replace('{occasion}', occasions[Math.floor(seededRandom(0, occasions.length))])
      .replace('{minor_issue}', minorIssues[Math.floor(seededRandom(0, minorIssues.length))])
      .replace('{issue}', issues[Math.floor(seededRandom(0, issues.length))])
      .replace('{positive}', features[Math.floor(seededRandom(0, features.length))])
      .replace('{negative}', issues[Math.floor(seededRandom(0, issues.length))]);
    const daysAgo = Math.floor(seededRandom(1, 60));
    reviews.push({ user_name: `${firstName} ${lastName}`, rating, comment, created_at: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(), helpful_count: Math.floor(seededRandom(0, 50)), verified: true, id: `gen_${productId}_${i}` });
  }
  return reviews.sort((a, b) => b.helpful_count - a.helpful_count);
};

const BundleReviews = ({ bundle }) => {
  const [showAll, setShowAll] = useState(false);
  const [expandedSection, setExpandedSection] = useState(true);
  const ratingInfo = getDisplayRating(bundle.reviews, bundle.average_rating);
  const realReviews = bundle.reviews || [];
  const generatedReviews = useMemo(() => generateReviews(bundle.id, ratingInfo.rating), [bundle.id, ratingInfo.rating]);
  const allReviews = useMemo(() => {
    if (realReviews.length > 0) return [...realReviews, ...generatedReviews].slice(0, 20);
    return generatedReviews;
  }, [realReviews, generatedReviews]);
  const displayedReviews = showAll ? allReviews : allReviews.slice(0, 5);
  const totalCount = allReviews.length;
  const distribution = useMemo(() => {
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    allReviews.forEach(r => { if (r.rating >= 1 && r.rating <= 5) dist[r.rating]++; });
    return dist;
  }, [allReviews]);

  const renderStars = (rating, size = 14) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const decimal = rating - fullStars;
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<Star key={i} size={size} className="fill-yellow-400 dark:fill-yellow-400 text-yellow-400 dark:text-yellow-400" />);
      } else if (i === fullStars + 1 && decimal >= 0.3) {
        stars.push(
          <div key={i} className="relative inline-block">
            <Star size={size} className="fill-slate-200 dark:fill-tppdarkwhite/20 text-slate-200 dark:text-tppdarkwhite/20" />
            <div className="absolute inset-0 overflow-hidden" style={{ width: `${decimal * 100}%` }}>
              <Star size={size} className="fill-yellow-400 dark:fill-yellow-400 text-yellow-400 dark:text-yellow-400" />
            </div>
          </div>
        );
      } else {
        stars.push(<Star key={i} size={size} className="fill-slate-200 dark:fill-tppdarkwhite/20 text-slate-200 dark:text-tppdarkwhite/20" />);
      }
    }
    return stars;
  };

  return (
    <div className="w-full">
      <button onClick={() => setExpandedSection(!expandedSection)} className="w-full px-4 py-3 bg-tppslate dark:bg-tppdark flex items-center justify-between">
        <h2 className="text-base font-bold text-white dark:text-tppdarkwhite tracking-tight">Customer Reviews</h2>
        {expandedSection ? <ChevronUp size={20} className="text-white dark:text-tppdarkwhite" /> : <ChevronDown size={20} className="text-white dark:text-tppdarkwhite" />}
      </button>

      <AnimatePresence>
        {expandedSection && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
            <div className="px-4 py-4 space-y-4">
              <div className="flex items-center gap-6 pb-4 border-b border-slate-100 dark:border-tppdarkwhite/10">
                <div className="text-center">
                  <p className="text-4xl font-bold text-tppslate dark:text-tppdarkwhite mb-1">{formatRating(ratingInfo.rating)}</p>
                  <div className="flex gap-0.5 mb-1 justify-center">{renderStars(ratingInfo.rating, 12)}</div>
                  <p className="text-xs text-slate-500 dark:text-tppdarkwhite/40 font-medium">{totalCount} reviews</p>
                </div>
                <div className="flex-1 space-y-1.5">
                  {[5,4,3,2,1].map((rating) => {
                    const count = distribution[rating];
                    const percentage = totalCount > 0 ? (count / totalCount) * 100 : 0;
                    return (
                      <div key={rating} className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-600 dark:text-tppdarkwhite/50 w-2">{rating}</span>
                        <Star size={10} className="fill-yellow-400 dark:fill-yellow-400 text-yellow-400 dark:text-yellow-400" />
                        <div className="flex-1 h-2 bg-slate-100 dark:bg-tppdarkwhite/10 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${percentage}%` }} transition={{ duration: 0.5, delay: rating * 0.1 }} className="h-full bg-yellow-400 dark:bg-yellow-400 rounded-full" />
                        </div>
                        <span className="text-xs text-slate-500 dark:text-tppdarkwhite/40 w-8 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <AnimatePresence>
                  {displayedReviews.map((review, index) => (
                    <motion.div key={review.id || index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3, delay: index * 0.05 }} className="pb-3 border-b border-slate-100 dark:border-tppdarkwhite/10 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-tpppink/10 dark:bg-tppdarkwhite/10 flex items-center justify-center text-tpppink dark:text-tppdarkwhite font-bold text-sm">
                            {review.user_name?.charAt(0) || 'A'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-tppslate dark:text-tppdarkwhite">{review.user_name || 'Anonymous'}</span>
                              {review.verified && <CheckCircle size={12} className="text-green-600 dark:text-green-400" />}
                            </div>
                            <p className="text-xs text-slate-400 dark:text-tppdarkwhite/30">{formatTimeAgo(review.created_at)}</p>
                          </div>
                        </div>
                        <div className="flex gap-0.5">{renderStars(review.rating, 12)}</div>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-tppdarkwhite/70 leading-relaxed mb-2">{review.comment}</p>
                      <button className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-tppdarkwhite/40 hover:text-tpppink dark:hover:text-tppdarkwhite transition-colors">
                        <ThumbsUp size={12} /><span>Helpful ({review.helpful_count || 0})</span>
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {allReviews.length > 5 && (
                <motion.button onClick={() => setShowAll(!showAll)} className="w-full py-3 border-2 border-tpppink dark:border-tppdarkwhite text-tpppink dark:text-tppdarkwhite rounded-lg font-bold text-sm hover:bg-tpppink dark:hover:bg-tppdarkwhite hover:text-white dark:hover:text-tppdark transition-all flex items-center justify-center gap-2" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  {showAll ? <><ChevronUp size={16} />Show Less</> : <><ChevronDown size={16} />Show More Reviews ({allReviews.length - 5} more)</>}
                </motion.button>
              )}

              <button className="w-full py-3 bg-tpppink dark:bg-tppdarkwhite text-white dark:text-tppdark rounded-lg font-bold text-sm hover:bg-tppslate dark:hover:bg-tppdarkwhite/90 transition-all">
                Write a Review
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BundleReviews;