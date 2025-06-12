// review.service.ts
import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, query, orderBy } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Review } from '../model/review.model';

@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  constructor(private firestore: Firestore) {}

  addReview(review: Review) {
    const reviewsRef = collection(this.firestore, 'reviews');
    return addDoc(reviewsRef, review);
  }

  getReviews(): Observable<Review[]> {
    const reviewsRef = collection(this.firestore, 'reviews');
    const reviewsQuery = query(reviewsRef, orderBy('timestamp', 'desc'));
    return collectionData(reviewsQuery, { idField: 'id' }) as Observable<Review[]>;
  }
}
