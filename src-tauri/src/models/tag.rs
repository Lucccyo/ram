use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Tag {
    pub id: u32,
    pub label: String,
    pub use_count: i32,
}
