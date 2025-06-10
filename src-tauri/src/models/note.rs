use serde::{Serialize, Deserialize};
use crate::models::tag::Tag;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Note {
    pub id: u32,
    pub title: String,
    pub tags: Vec<Tag>,
    pub sub_notes: Vec<Note>,
}